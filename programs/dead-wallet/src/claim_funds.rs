use anchor_lang::{prelude::*, system_program::{self}};
use anchor_spl::{ associated_token::{self, AssociatedToken}, token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked }};

use crate::{error::Errors, states::{Heir, HeirStatus, Vault, WillAccount}};


#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    signer:Signer<'info>,
    will_account_address:SystemAccount<'info>,
    #[account(
    mut,
    seeds=[b"will" , will_account_address.key().as_ref() ],
    bump
    )]
    will_account:Account<'info, WillAccount>,
    #[account(
        mut,
        seeds=[b"heir", heir_account_address.key().as_ref(), will_account.key().as_ref() ],
        bump
    )]
    heir_account:Account<'info, Heir>,
    #[account(mut)]
    heir_account_address:SystemAccount<'info>,
    #[account(
        mut,
        seeds=[b"vault" , will_account.key().as_ref()],
        bump
    )]
    vault_account: Account<'info, Vault>,
    system_program:Program<'info, System>,
    associated_token_program:Program<'info, AssociatedToken>
}


pub fn claim<'info>(
    ctx: Context<'_, '_, 'info, 'info, Claim<'info>>,
) -> Result<()> {

    let clock = Clock::get()?;
    let will = ctx.accounts.will_account.clone();
    let heir = ctx.accounts.heir_account.clone();

    // validations
    require!(
        clock.unix_timestamp > will.last_check_in + will.interval,
        Errors::Will_Active
    );
    require!(!will.claimed, Errors::Will_Already_Claimed);
    require!(heir.status == HeirStatus::Active, Errors::Will_Already_Claimed);
    require!(
        heir.wallet_address == ctx.accounts.heir_account_address.key(),
        Errors::Heir_Not_Valid
    );

    let accounts = ctx.remaining_accounts;
    let assets = will.assets.clone();

    require!(accounts.len() % 4 == 0, Errors::ClaimFundsAccountsNotValid);
    require!(assets.len() * 4 == accounts.len(), Errors::ClaimFundsAccountsNotValid);

    let will_key = will.key();
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"vault",
        will_key.as_ref(),
        &[ctx.bumps.vault_account],
    ]];

    // =========================
    // 🪙 SPL TRANSFERS FIRST (all CPIs)
    // =========================
    let mut i = 0;
    let mut processed_mints: Vec<Pubkey> = Vec::new();

    while i < accounts.len() {
        let vault_ata  = &accounts[i];
        let heir_ata   = &accounts[i + 1];
        let mint_acc   = &accounts[i + 2];
        let token_prog = &accounts[i + 3];

        require!(
            token_prog.key() == anchor_spl::token::ID
                || token_prog.key() == anchor_spl::token_2022::ID,
            Errors::InvalidTokenProgram
        );

        let vault_data = InterfaceAccount::<TokenAccount>::try_from(vault_ata)?;
        let mint_data  = InterfaceAccount::<Mint>::try_from(mint_acc)?;

        require!(!processed_mints.contains(&mint_acc.key()), Errors::MintAccountNotValid);
        require!(assets.iter().any(|a| a.mint == vault_data.mint), Errors::MintAccountNotValid);
        require!(vault_data.mint == mint_acc.key(), Errors::MintAccountNotValid);
        require!(vault_data.owner == ctx.accounts.vault_account.key(), Errors::VaultATAInvalid);

        // Create heir ATA if needed (CPI)
        if heir_ata.data_is_empty() {
            associated_token::create(CpiContext::new(
                ctx.accounts.associated_token_program.to_account_info(),
                associated_token::Create {
                    associated_token: heir_ata.to_account_info(),
                    authority: ctx.accounts.heir_account_address.to_account_info(),
                    mint: mint_acc.to_account_info(),
                    payer: ctx.accounts.signer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: token_prog.to_account_info(),
                },
            ))?;
        }

        let asset = assets
            .iter()
            .find(|a| a.mint == vault_data.mint)
            .ok_or(Errors::MintAccountNotValid)?;

        let user_share = asset.balance
            .checked_mul(heir.bps as u64)
            .ok_or(Errors::Math_Error)?
            .checked_div(10000)
            .ok_or(Errors::Math_Error)?;

        require!(user_share > 0, Errors::Math_Error);

        // SPL transfer (CPI)
        transfer_checked(
            CpiContext::new_with_signer(
                token_prog.to_account_info(),
                TransferChecked {
                    from:      vault_ata.to_account_info(),
                    to:        heir_ata.to_account_info(),
                    authority: ctx.accounts.vault_account.to_account_info(),
                    mint:      mint_acc.to_account_info(),
                },
                signer_seeds,
            ),
            user_share,
            mint_data.decimals,
        )?;

        processed_mints.push(mint_acc.key());
        i += 4;
    }

    // =========================
    // 💰 SOL TRANSFER LAST (raw lamports, no CPI after this)
    // =========================
    if will.has_sol {
        let sol_amount = (will.total_bal as u64)
            .checked_mul(heir.bps as u64)
            .ok_or(Errors::Math_Error)?
            .checked_div(10000)
            .ok_or(Errors::Math_Error)?;

        require!(sol_amount > 0, Errors::Math_Error);

let vault_info = ctx.accounts.vault_account.to_account_info();
        let min_rent = Rent::get()?.minimum_balance(vault_info.data_len());

        require!(
            vault_info.lamports().checked_sub(sol_amount).ok_or(Errors::Math_Error)? >= min_rent,
            Errors::InsufficientFundsForRent
        );

        **vault_info.try_borrow_mut_lamports()? -= sol_amount;
        **ctx.accounts.heir_account_address
            .to_account_info()
            .try_borrow_mut_lamports()? += sol_amount;
    }

    // No CPIs after this point ✅
    ctx.accounts.heir_account.status = HeirStatus::Claimed;
    ctx.accounts.will_account.claimed = true;

    msg!("claim complete");
    Ok(())
}
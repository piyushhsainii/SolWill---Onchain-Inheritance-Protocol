import toast from "react-hot-toast";

export async function mockTx(message: string) {
  toast.loading("⏳ Transaction pending...");
  await new Promise((r) => setTimeout(r, 2000));
  toast.dismiss();
  toast.success(message);
}

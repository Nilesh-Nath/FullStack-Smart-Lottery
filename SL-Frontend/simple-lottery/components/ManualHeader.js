import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3 } =
    useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("Connected")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Changed to : ${account}`);
      if (account == null) {
        window.localStorage.removeItem("Connected");
        deactivateWeb3();
      }
    });
  }, []);

  return (
    <>
      {account ? (
        <div>
          Connected Account :{account.slice(0, 6)}....
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== "undefined") {
              window.localStorage.setItem("Connected", "Injected");
            }
          }}
        >
          Connect
        </button>
      )}
    </>
  );
}

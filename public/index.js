/** @type JsonRpcSigner */
let signer;

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element.value) {
    element.value = value;
  } else {
    element.innerText = value;
  }
};

const connectMetaMask = async () => {
  console.log("connecting to MetaMask");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  const balance = ethers.utils.formatEther(await signer.getBalance());
  console.log(`balance: ${balance} ETH`);
  setText("public-key", await signer.getAddress());
  return provider;
};

const signData = async (input) => {
  if (!signer) {
    window.alert("connect wallet before signing");
    return;
  }
  input = new TextEncoder().encode(input);
  const output = await signer.signMessage(input);
  setText("output", output);
};

const verifyData = (input, output) => {
  const address = document.getElementById("public-key").value;
  const result = ethers.utils.verifyMessage(input, output);
  const resultMessage = `${result}\n${
    (address.toLocaleString() === result.toLocaleString())
      .toString().toUpperCase()
  }`;
  console.log('result: ', result);
  setText("verification", resultMessage);
};

// Connect to MetaMask.
const main = async() => {
  await connectMetaMask();
};

document
  .querySelector("#btn-connect")
  .addEventListener("click", () =>
    main()
    .then(() => console.log("done"))
    .catch((e) => console.error(e))
  );

document
  .querySelector("#btn-sign")
  .addEventListener("click", () =>
    signData(
      document
        .getElementById("input")
        .value
    )
  );

document
  .querySelector("#btn-verify")
  .addEventListener("click", () =>
    verifyData(
      document
        .getElementById("input")
        .value,
      document
        .getElementById("output")
        .value
    )
  );

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

const getText = (id) => {
  const element = document.getElementById(id);
  return element.value
    ? element.value
    : element.innerText;
}

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
  const address = getText("public-key");
  const result = ethers.utils.verifyMessage(input, output);
  const resultMessage = `${result}\n${
    (address.toLocaleString() === result.toLocaleString())
      .toString().toUpperCase()
  }`;
  console.log('result: ', result);
  setText("verification", resultMessage);
};

const searchToObject = () => {
  const pairs = window.location.search.substring(1).split("&");
  const obj = {};
  for (let i in pairs) {
    if (pairs[i] === "") continue;
    const pair = pairs[i].split("=");
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return obj;
}

const buildSharingLink = () => {
  const params = {
    address: getText("public-key"),
    input: getText("input"),
    output: getText("output")
  };
  let qs = "";
  const getPrefix = () => qs === "" ? "?" : "&";
  if (params.address)
    qs += `${getPrefix()}address=${params.address}`;
  if (params.input)
    qs += `${getPrefix()}input=${params.input}`;
  if (params.output)
    qs += `${getPrefix()}output=${params.output}`;
  const link = window.location.origin +
    window.location.pathname + qs;
  setText("link", link);
};

const loadQueryString = () => {
  const qs = searchToObject();
  if (qs.address)
    setText("public-key", qs.address);
  if (qs.input)
    setText("input", qs.input);
  if (qs.output)
    setText("output", qs.output);
  if (qs.input && qs.output)
    verifyData(qs.input, qs.output);
  buildSharingLink();
};

loadQueryString();

document
  .querySelector("#btn-connect")
  .addEventListener("click", () =>
    connectMetaMask()
    .then(() => console.log("done"))
    .catch((e) => console.error(e))
  );

document
  .querySelector("#btn-sign")
  .addEventListener("click", () =>
    signData(getText("input"))
  );

document
  .querySelector("#btn-verify")
  .addEventListener("click", () =>
    verifyData(getText("input"), getText("output"))
  );

import { useState } from "react";
import Web3, { eth } from "web3";
import {ABI, Address} from "./Global/contract.js"

const web3 = new Web3();
var contract;
var userAccount;

const Home = () => {
    var provider;
    const [account, setAccount] = useState();
    const [ethBalance, setEthBalance] = useState("");
    const [contractBalance, setContractBalance] = useState("");
    const [approveTxId, setApproveTxId] = useState("0");
    const [revokeTxId, setRevokeTxId] = useState("0");
    const [executeTxId, setExecuteTxId] = useState("0");
    const [watchTxId, setWatchTxId] = useState(0);
    const [tx, setTx] = useState();
    const [owners, setOwners] = useState();
    const [more, setMore] = useState(false);
    const [approved, setApproved] = useState();
    const [depositEth, setDepositEth] = useState(0);
    const [depositAddr, setDepositAddr] = useState("");
    const [submitAddr, setSubmitAddr] = useState("");
    const [submitEth, setSubmitEth] = useState("");
    const [submitTxData, setSubmitTxdata] = useState("0");

    const [log, setLog] = useState(false);
    const [depositError, setDepositError] = useState(false);
    const [submitError, setSubmitError] = useState(false);

    const [numOfSubmit, setNumOfSubmit] = useState();

    const getInitData = async() =>
    {
        getNumOfSubmit();
    }

    const getNumOfSubmit = async() =>
    {
        var count = 0;
        try{
            while(true)
            {
                await contract.methods.transactions(count).call();
                count++;
            }
        }catch
        {   
            setNumOfSubmit(count);
        }
    }

    const connect2BlockChain = async() =>
    {
        if(!provider)
        {
            if(window.ethereum)
            {
                provider = window.ethereum;
                console.log("使用 window.ethereum.")
            }
            else if(window.web3)
            {
                provider = window.web3.currentProvider;
                console.log("使用 window.web3.currentProvider")
            }
            else
                console.log("Non-ethereum browser detected. You should install Matamask");

            console.log(provider)
        }
        else
        {
            console.log("已有Provider!");
        }
    }
    
    window.ethereum.on('accountsChanged',async function (accounts) {
        console.log(accounts[0]);
        setAccount(accounts[0]);
        const ethBalancde = await web3.eth.getBalance(accounts[0]);
        setEthBalance(String(ethBalancde));
    })

    const connect2Wallet = async() =>
    {
        console.log("Connect to wallet...");
        web3.setProvider(provider);
        await provider.request({method: 'eth_requestAccounts'});
        userAccount = await web3.eth.getAccounts();
        console.log(userAccount);
        setAccount(userAccount[0]);
        const ethBalancde = await web3.eth.getBalance(userAccount[0]);
        setEthBalance(String(ethBalancde));
    }

    const connect2Contract = async() =>
    {
        if(!contract)
        {
            contract = new web3.eth.Contract(ABI, Address);
            const C_Balancde = await web3.eth.getBalance(Address);
            setContractBalance(String(C_Balancde));
            console.log(contract);
            console.log("獲取合約完畢");
            getOwners();
        }
        else
            console.log("已有獲取到的合約")
    }

    const login = async() =>
    {
        await connect2BlockChain(); 
        await connect2Wallet();
        await connect2Contract();
        await getInitData();
        setLog(true);
    }

    const getOwners = async() =>
    {
        var length = 0;
        let _owners = [];
        try{
            while(true)
            {
                const ownerAddr = await contract.methods.owners(length).call();
                console.log(ownerAddr);
                _owners.push(ownerAddr);
                length++;
            }
        }
        catch(e)
        {   
            setOwners(_owners);
            console.log("獲取Owners完畢");
        }
    }

    const deposit = async() =>
    {   
        if(!depositAddr || !depositEth)
            setDepositError(true);
        else
        {   
            try
            {   
                
                if(!web3.utils.isAddress(depositAddr))
                {   
                    setDepositError(true);
                    throw 123;
                }
                setDepositError(false);

                await web3.eth.sendTransaction(
                    {
                        from:account,
                        to:depositAddr,
                        value:depositEth
                    }
                )
                
            }catch(e)
            {
                console.log(e);
            }
            const ethBalancde = await web3.eth.getBalance(account);
            setEthBalance(String(ethBalancde));
            const C_Balancde = await web3.eth.getBalance(Address);
            setContractBalance(String(C_Balancde));
        }
    }

    const depositEthChange = (e) =>
    {   
        if(e.target.value < 0)
            e.target.value = 0;
        setDepositEth(e.target.value);
    }

    const depositAddrChange = (e) =>
    {
        setDepositAddr(e.target.value);
    }

    const submit = async() =>
    {   
        try{
            if(web3.utils.isAddress(submitAddr))
                setSubmitError(false);
            await contract.methods.submit(submitAddr, submitEth, web3.utils.utf8ToHex(submitTxData)).send({from:account,gas: '1000000'});
            const C_Balancde = await web3.eth.getBalance(Address);
            setContractBalance(String(C_Balancde));
            setNumOfSubmit(prevNumOfSubmit => prevNumOfSubmit + 1);
        } catch(e)
        {      
            console.log(e)
        }
    }

    const submitAddrChange = (e) =>
    {
        setSubmitAddr(e.target.value);
    }

    const submitEthChange = (e) =>
    {   
        if(e.target.value < 0)
            e.target.value = 0;
        setSubmitEth(e.target.value);
    }

    const submitTxDataChange = (e) =>
    {
        setSubmitTxdata(e.target.value);
    }

    const approveTxIdChange = (e) =>
    {   
        checkTxValue(e);
        setApproveTxId(e.target.value);
    }

    const approve = async() =>
    {   
        await contract.methods.approve(approveTxId).send({from:account});
        console.log(account + " approve No." + approveTxId + " Tx!")
    }

    const watchTxIdChange = (e) =>
    {   
        checkTxValue(e);
        setWatchTxId(e.target.value);
    }

    const watchTx = async() =>
    {   
        
        setTx(await contract.methods.transactions(watchTxId).call());
        console.log(tx); 
    }

    const watchApprove = async() =>
    {   
        var _approved = [];
        for(var i = 0; i < owners.length; i++)
        {
            _approved[i] = await contract.methods.approved(watchTxId, owners[i]).call();
        }
        setApproved(_approved);
        setMore(true);
    }

    const close = () =>
    {
        setMore(false);
    }

    const revoke = async() =>
    {
        await contract.methods.revoke(revokeTxId).send({from:account});
        console.log(account + " revoke No." + revokeTxId + " Tx!");
    }

    const revokeTxIdChange = (e) =>
    {   
        checkTxValue(e);
        setRevokeTxId(e.target.value);
    }

    const execute = async() =>
    {
        await contract.methods.execute(executeTxId).send({from:account});
        console.log(account + " execute No." + executeTxId + " Tx!");
        const ethBalancde = await web3.eth.getBalance(account);
        setEthBalance(String(ethBalancde));
        const C_Balancde = await web3.eth.getBalance(Address);
        setContractBalance(String(C_Balancde));

    }

    const executeTxIdChange = (e) =>
    {   
        checkTxValue(e);
        setExecuteTxId(e.target.value);
    }

    const checkTxValue = (e) =>
    {
        if(e.target.value < 0)
            e.target.value = 0;

        if(e.target.value > numOfSubmit - 1)
            e.target.value =  numOfSubmit - 1;
    }
    return(
        <div>
            <div>錢包地址: {account}</div>
            <div>錢包餘額: {ethBalance / 10**18} ETH</div>
            <div>合約地址: {Address}</div>
            <div>合約存款餘額: {contractBalance / 10**18} ETH</div>
            <div>Number of Submit: {numOfSubmit}</div>
            {!log &&(
                <div onClick={login}> Login </div>
            )}
            {log && 
            (<div>
                <div>---------------------</div>
                <div>
                    <span>To_Addr: </span>
                    <input type="text" onChange={depositAddrChange}></input>
                </div>
                <div>
                    <span>Wei: </span>
                    <input type="number" onChange={depositEthChange}></input>
                </div>
                <div onClick={deposit}> Deposit </div>
                {depositError && (
                    <div>!!參數有誤!!</div>
                )}
                <div>---------------------</div>
                <div>
                    <span>To_Addr: </span>
                    <input type="text" onChange={submitAddrChange}></input>
                </div>
                <div>
                    <span>Wei: </span>
                    <input type="text" onChange={submitEthChange}></input>
                </div>
                <div>
                    <span>TxData: </span>
                    <input type="text" onChange={submitTxDataChange}></input>
                </div>
                <div onClick={submit}> Submit </div>
                { submitError && (
                    <div>!!參數有誤!!</div>
                )}
                <div>---------------------</div>
                <input type="number" defaultValue="0" onChange={watchTxIdChange}></input>
                <div onClick={watchTx}>查詢已提交的交易申請</div>
                {tx && (
                    <div>
                        <div>to: {tx.to}</div>
                        <div>value: {Number(String(tx.value))/10**18} ETH </div>
                        <div>execute: {String(tx.executed)}</div>
                        {!more && (
                            <div onClick={watchApprove}>查看更多</div>
                        )}
                        {more && (
                            <div>
                                <div onClick={close}>收起</div>
                                {owners.map((owner) => {
                                    return(
                                        <div>{owner}: {String(approved[owners.indexOf(owner)])}</div>
                                    );
                                })}
                            </div>
                        )}
                    </div>)
                }
                <div>---------------------</div>
                <input type="number" defaultValue="0" onChange={approveTxIdChange}></input>
                <div onClick={approve}>Approve</div>
                <div>---------------------</div>
                <input type="number" defaultValue="0" onChange={revokeTxIdChange}></input>
                <div onClick={revoke}>Revoke</div>
                <div>---------------------</div>
                <input type="number" defaultValue="0" onChange={executeTxIdChange} oninput="if (value < 0) value = 0;if(value>60)value=60"></input>
                <div onClick={execute}>Execute</div>
                <div>---------------------</div>
            </div>
            )}
        </div>
    )
}

export default Home;
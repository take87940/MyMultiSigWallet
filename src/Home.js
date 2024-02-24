import { useState } from "react";
import Web3 from "web3";
import {ABI, Address} from "./Global/contract.js"

const web3 = new Web3();
var contract;
var userAccount;

const Home = () => {
    
    const [account, setAccount] = useState();
    const [provider, setProvider] = useState();
    const [ethBalance, setEthBalance] = useState("");
    const [contractBalance, setContractBalance] = useState("");
    const [approveTxId, setApproveTxId] = useState("");
    const [revokeTxId, setRevokeTxId] = useState("");
    const [executeTxId, setExecuteTxId] = useState("");
    const [watchTxId, setWatchTxId] = useState(0);
    const [tx, setTx] = useState();
    const [owners, setOwners] = useState();
    const [more, setMore] = useState(false);
    const [approved, setApproved] = useState();
    const [depositEth, setDepositEth] = useState(0);

    function connect2BlockChain()
    {
        if(!provider)
        {
            if(window.ethereum)
            {
                setProvider(window.ethereum)
                console.log("使用 window.ethereum.")
            }
            else if(window.web3)
            {
                setProvider(window.web3.currentProvider);
                console.log("使用 window.wrb3.currentProvider")
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
    
    const connect2Wallet = async() =>
    {
        if(!account)
        {
            console.log("Connect to wallet...");
            await provider.request({method: "eth_requestAccounts"});
            web3.setProvider(provider);
            userAccount = await web3.eth.getAccounts();
            console.log(userAccount);
            setAccount(userAccount[0]);
            const ethBalancde = await web3.eth.getBalance(userAccount[0]);
            setEthBalance(String(ethBalancde));
        }
        else
            console.log("已有連接上的錢包")
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
        }
        else
            console.log("已有獲取到的合約")
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

    const deposit = async(e) =>
    {
        await web3.eth.sendTransaction(
            {
                from:account,
                to:Address,
                value:1000000000000000000
            }
        );
        const ethBalancde = await web3.eth.getBalance(account);
        setEthBalance(String(ethBalancde));
        const C_Balancde = await web3.eth.getBalance(Address);
        setContractBalance(String(C_Balancde));
    }

    const submit = async() =>
    {
        await contract.methods.submit("0x7196472C5702f973bB6572eE104D660129DFEA23", "1000000000000", web3.utils.utf8ToHex('Test1')).send({from:account,gas: '1000000'});
        const C_Balancde = await web3.eth.getBalance(Address);
        setContractBalance(String(C_Balancde));
    }

    const approveTxIdChange = (e) =>
    {
        setApproveTxId(e.target.value);
    }

    const approve = async() =>
    {   
        await contract.methods.approve(approveTxId).send({from:account});
        console.log(account + " approve No." + approveTxId + " Tx!")
    }

    const watchTxIdChange = (e) =>
    {
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
        setRevokeTxId(e.target.value);
    }

    const execute = async() =>
    {
        await contract.methods.execute(executeTxId).send({from:account});
        console.log(account + " execute No." + executeTxId + " Tx!");
    }

    const executeTxIdChange = (e) =>
    {
        setExecuteTxId(e.target.value);
    }

    return(
        <div>
            <div>錢包地址: {account}</div>
            <div>錢包餘額: {ethBalance}</div>
            <div>合約地址: {Address}</div>
            <div>合約存款餘額: {contractBalance}</div>
            <div onClick={connect2BlockChain}> 連接區塊鏈 </div>
            <div onClick={connect2Wallet}> 連接錢包 </div>
            <div onClick={connect2Contract}> 連接合約 </div>
            <div onClick={getOwners}> 取得Owners </div>
            <div onClick={deposit}> Deposit </div>
            <div onClick={submit}> Submit </div>
            <div>---------------------</div>
            <input type="number" onChange={watchTxIdChange}></input>
            <div onClick={watchTx}>查詢已提交的交易申請</div>
            {tx && (
                <div>
                    <div>to: {tx.to}</div>
                    <div>value: {String(tx.value)}</div>
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
            <input type="text" onChange={approveTxIdChange}></input>
            <div onClick={approve}>Approve</div>
            <div>---------------------</div>
            <input type="text" onChange={revokeTxIdChange}></input>
            <div onClick={revoke}>Revoke</div>
            <div>---------------------</div>
            <input type="text" onChange={executeTxIdChange}></input>
            <div onClick={execute}>Execute</div>
            <div>---------------------</div>
        </div>
    )
}

export default Home;
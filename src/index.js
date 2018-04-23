//web3 1.0 beta is not supported by MetaMask now (10-Apr-2018)
//using web3@^0.19.0 here to interact with deployed contracts
//var app = document.getElementById('app');
var Web3, utils, contractabi, contractaddr, MyContract, ContractInstance, InjectedWeb3
// var Web3 = require('web3');
// var utils = require('./abi.js');
// var contractabi = utils.conractabi();
// var contractaddr = "0xba5ba811ff49df20591b8b5933549af26dc68b2d";
// var MyContract = web3.eth.contract(contractabi,(err, ctr) => {return ctr} );
// var ContractInstance = MyContract.at(contractaddr,(err, cont) => {return cont});

//var app = document.getElementById('app');
//var betAmt = document.getElementById('BetAmt');
//var picknum = document.getElementById('picknum');
// var minbet;
// var totbetamt;
// var lastwin;
// var betsplaced;
InjectedWeb3 = typeof web3;
window.onload = function(){
    if (InjectedWeb3 != 'undefined') {
        // Use Mist/MetaMask's provider
        app.innerHTML = 'Web3 exist!';
        Web3 = require('web3');
        utils = require('./abi.js');
        contractabi = utils.conractabi();
        contractaddr = "0xba5ba811ff49df20591b8b5933549af26dc68b2d";
        MyContract = web3.eth.contract(contractabi,(err, ctr) => {return ctr} );
        ContractInstance = MyContract.at(contractaddr,(err, cont) => {return cont});

        web3 = new Web3(web3.currentProvider);
        //app.innerHTML = web3.currentProvider.isMetaMask;
        web3.version.getNetwork((err, netId) => {
         switch (netId) {
           case "1":
             app.innerHTML = 'This is mainnet';
             break
           case "2":
             app.innerHTML = 'This is the deprecated Morden test network.';
             break
           case "3":
             app.innerHTML = 'This is the Ethereum Ropsten test network.';
             break
           default:
             app.innerHTML = 'This is an unknown network.';
         }
         app.innerHTML = app.innerHTML+' Your bet will reflect after the next block is mined';
       });
    }
    else {
    //    console.log('Injected web3 Not Found!!!Install MetaMask and reload')
       app.innerHTML = 'No web3? You should consider trying MetaMask!';
       alert('Install MetaMask plugin to play');
    //    fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    ContractInstance.minBetAmount(function(error, result){
        if(error) 
                minBetAmt.innerHTML = error;
        else{
                minBetAmt.innerHTML = result + " Wei";//web3.fromWei(result,'ether')+" Ether";
                //minbet = minBetAmt.innerHTML;
        }
    });

    ContractInstance.totalBetAmount(function(error, result){
        if(error) 
                prizeamt.innerHTML = error;
        else{
                prizeamt.innerHTML = result + " Wei";
                //web3.fromWei(result,'ether')+" Ether";
                //totbetamt = prizeamt.innerHTML;
        }
    });

    ContractInstance.lastwinningNumber(function(error, result){
        if(error) 
                lstWin.innerHTML = error;
        else{
                lstWin.innerHTML = result;
                //lastwin = lstWin.innerHTML;
        }
    });

    ContractInstance.BetsPlaced(function(error, result){
        if(error) 
                totBet.innerHTML = error;
        else{
                totBet.innerHTML = result;
                //betsplaced = totbet.innerHTML;
        }
    });

    ContractInstance.maxBetsLimit(function(error, result){
        if(error) 
                maxBet.innerHTML = error;
        else{
                maxBet.innerHTML = result;
        }
    });

}

window.placeBet = function(){
    if(InjectedWeb3 == 'undefined'){
        alert('Install MetaMask plugin to play');
        return;
    }
    if(web3.eth.accounts[0] == null)
        alert('Connect MetaMask');
    else{
        if(BetAmt.value >= parseInt(minBetAmt.innerHTML)){
            // alert(parseInt(BetAmt.value));
            // alert(web3.eth.accounts[0]);
            // alert(parseInt(picknum.value)); 
            ContractInstance.bet(parseInt(picknum.value), {
                    gas: 300000,
                    from: web3.eth.accounts[0],
                    value:parseInt(BetAmt.value)// web3.toWei(parseInt(BetAmt.value), 'wei')
                }, (err, result) => {
                    alert('https://ropsten.etherscan.io/tx/'+result);
                    alert('Bet Placed. May be the odds be ever in your favor!')
                    txn.href = 'https://ropsten.etherscan.io/tx/'+result;
                    //window.location.reload();
            });
        }
        else 
            alert('Bet Amount less than Minimum bet required to play');
    }
}

window.claimWin = function(){
    if(InjectedWeb3 == 'undefined'){
        alert('Install MetaMask plugin to play');
        return;
    }
    if(web3.eth.accounts[0] == null)
        alert('Connect MetaMask');
    else{
        ContractInstance.claimWinnings(function(error, result){
            if(error)
                alert('Sorry!!Better Luck next time');
            else
                alert('Winings!!! Party Time!!!')
        });
    }
}

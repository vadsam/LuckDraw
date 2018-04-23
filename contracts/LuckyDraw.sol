pragma solidity ^0.4.0;

//Application where users are able to bet money on a number between 1 and 10 
//and if they’re correct, they win a portion of all the ether collected 

contract LuckyDraw {
    
    address public owner;
    uint256 public minBetAmount;
    uint256 public maxBetsLimit;
    uint256 public totalBetAmount;
    uint256 public BetsPlaced;
    uint256 public winningNumber;
    uint256 public lastwinningNumber;
    uint256 public winnerCount;
    address[] public players;
    address[] public winners;

    modifier isOwner{
        require(owner == msg.sender);
        _;
    }
    
    struct Player {
        uint256 amountBet;
        uint256 numberSelected;
    }
    
    mapping(address => Player) public playerInfo;
    mapping(address => uint256) public winnerList;
    
    function() public payable {}
    
    function LuckyDraw(uint256 minBet, uint256 maxBet) public {
        owner = msg.sender;
        minBetAmount = 1;
        maxBetsLimit = 10;
        if(minBet != 0)
            minBetAmount = minBet;
        if(maxBet != 0)
            maxBetsLimit = maxBet;
    }
    
    function RemoveContract () isOwner public {
        selfdestruct(owner);
    }
    
    function PlayerExists() public view returns(bool){
        if(playerInfo[msg.sender].amountBet >= minBetAmount)
            return true;
    }
    
    function resetData() public{
       // Reset all variables and arrays
        BetsPlaced = 0;
        lastwinningNumber = winningNumber;
        winningNumber = 0;
        if(winners.length != 0)
            totalBetAmount = 0;
        players.length = 0; 
        winners.length = 0;
        winnerCount = 0;
    }
    
    function bet(uint256 numberpicked) public payable {
        require(BetsPlaced < maxBetsLimit);
        require(!PlayerExists());
        require(msg.value >= minBetAmount);
        require(numberpicked > 0 && numberpicked < 11);
        
        playerInfo[msg.sender].numberSelected = numberpicked;
        playerInfo[msg.sender].amountBet = msg.value;
        players.push(msg.sender);
        
        totalBetAmount += msg.value;
        BetsPlaced += 1;
        if(BetsPlaced == maxBetsLimit)
           DrawNumber();
    }
    
    function DrawNumber() public {
        winningNumber = (block.number*block.number)%10+1;
        uint256 betAmountfromWinners = 0;

        for(uint256 i=0; i<maxBetsLimit; i++){
            if(playerInfo[players[i]].numberSelected == winningNumber){
                betAmountfromWinners += playerInfo[players[i]].amountBet; 
                winners.push(players[i]);
                winnerCount++;
            }
            else{
                delete playerInfo[players[i]];
            }
        }
        
        if(winnerCount>0){
            uint256 winAmount;
            uint256 winShare;
            //Multiplying by 100000 to retain 5 decimal values
            //Solidity cannot handle decimal, float values yet
            winShare = (totalBetAmount*100000)/betAmountfromWinners;
            
            for(uint256 j=0; j<winnerCount; j++){
                winAmount = (winShare*playerInfo[winners[j]].amountBet)/100000;
                winnerList[winners[j]] += winAmount;
                delete playerInfo[winners[j]];
            }
        }
        
        resetData();
    }
    
    function claimWinnings() public {
        require(winnerList[msg.sender] > 0);
        msg.sender.transfer(winnerList[msg.sender]);
        delete winnerList[msg.sender];
    }
}
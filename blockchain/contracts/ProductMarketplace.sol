// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract INRToken is ERC20, Ownable {
    constructor(address marketplaceAddress) ERC20("INRToken", "INR") Ownable(marketplaceAddress) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

contract ProductMarketplace is Ownable {
    struct Product {
        uint256 id;
        uint256 price; // Price expressed in rupees (as token units)
        address owner;
        bool isSold;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount = 0;

    INRToken public inrToken;

    event ProductListed(uint256 indexed id, uint256 price, address owner);
    event ProductSold(uint256 indexed id, address buyer, uint256 price);
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EthTransferred(address indexed buyer, address indexed seller, uint256 amount);

    mapping(address => uint256) public walletBalance;

    constructor(address _inrTokenAddress) Ownable(msg.sender) {
    inrToken = INRToken(_inrTokenAddress);
    }

    // List a new product
    function listProduct(uint256 _price) external returns (uint256) {
        require(_price > 0, "Price must be greater than zero");

        uint256 newId = productCount;
        products[newId] = Product(newId, _price, msg.sender, false);
        emit ProductListed(newId, _price, msg.sender);
        productCount++;
        return newId;
    }

    function getProduct(uint256 productId) public view returns (
    uint256 id,
    uint256 price,
    address owner,
    bool isSold) {
    Product memory product = products[productId];
    require(productId < productCount, "Product does not exist");

    return (product.id, product.price, product.owner, product.isSold);
    }


    // Transfer product ownership after payment is handled off-chain
    // Only callable by the contract owner (trusted backend/admin) 
    function transferProductOwnership(uint256 _productId, address _newOwner) external onlyOwner {
        Product storage product = products[_productId];
        require(!product.isSold, "Product already sold");
        
        product.owner = _newOwner;
        product.isSold = true;
        emit ProductSold(_productId, _newOwner, product.price);
    }

     function transferETH(uint256 _productId, address _buyer, address _seller) external payable returns (bool) {
    Product storage product = products[_productId];
    require(!product.isSold, "Product already sold");
    require(msg.value > 0, "No ETH sent");
    require(msg.sender == _buyer, "Caller is not the buyer"); // Now _buyer is actually used
    
    // Transfer ETH to the seller from the buyer's signed transaction
    (bool success, ) = _seller.call{value: msg.value}("");
    require(success, "ETH transfer failed");
    emit EthTransferred(_buyer, _seller, msg.value);
    return true;
}

//User Balance
function getUserTokenBalance(address user) external view returns (uint256) {
    return inrToken.balanceOf(user);
}

function getETHBalance(address account) public view returns (uint256) {
    return account.balance;
}

    // Updated deposit: the user deposits an amount (in rupees) to mint INR tokens.
    function deposit(address user, uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");

        inrToken.mint(user, _amount);
        walletBalance[user] += _amount;

        emit Deposit(user, _amount);
    }

    function withdraw(address user, uint256 _amount) external {
        require(walletBalance[user] >= _amount, "Insufficient balance");

        walletBalance[user] -= _amount;
        inrToken.burn(user, _amount);

        emit Withdraw(user, _amount);
    }

    // Returns the total number of minted INR tokens
    function getTotalMintedTokens() external view returns (uint256) {
        return inrToken.totalSupply();
    }
}

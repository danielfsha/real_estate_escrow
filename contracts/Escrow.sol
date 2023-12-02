// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address payable public seller;
    address public lender;
    address public inspector;

    address public nftContractAddress;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public price;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;
    mapping(uint256 => uint256) public depositedAmount;

    constructor(
        address payable _seller,
        address _lender,
        address _inspector,
        address _nftContractAddress
    ) {
        seller = payable(_seller);
        inspector = _inspector;
        lender = _lender;

        nftContractAddress = _nftContractAddress;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only the Seller can call this");
        _;
    }

    modifier onlyBuyer(uint256 _id) {
        require(msg.sender == buyer[_id], "Only the Buyer can call this");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only the Inspector can call this");
        _;
    }

    function listProperty(
        uint256 _id,
        address _buyer,
        uint256 _price,
        uint256 _escrowAmount
    ) public payable onlySeller {
        IERC721(nftContractAddress).transferFrom(
            msg.sender,
            address(this),
            _id
        );

        isListed[_id] = true;
        price[_id] = _price;
        buyer[_id] = _buyer;
        escrowAmount[_id] = _escrowAmount;
    }

    function depositEarnest(uint256 _id) public payable onlyBuyer(_id) {
        require(msg.value >= escrowAmount[_id], "Downpayment isn't met");
        depositedAmount[_id] = msg.value;
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function updateInspectionStatus(
        uint256 _id,
        bool _passed
    ) public onlyInspector {
        inspectionPassed[_id] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        require(
            msg.sender == seller ||
                msg.sender == lender ||
                msg.sender == buyer[_nftID],
            "Only the Seller, Lender or Buyer can call this"
        );
        approval[_nftID][msg.sender] = true;
    }

    function finalizeSale(uint256 _id) public {
        require(inspectionPassed[_id]);
        require(approval[_id][buyer[_id]]);
        require(approval[_id][seller]);
        require(approval[_id][lender]);
        require(depositedAmount[_id] >= price[_id]);

        isListed[_id] = false;

        (bool success, ) = payable(seller).call{value: depositedAmount[_id]}(
            ""
        );
        require(success);

        IERC721(nftContractAddress).transferFrom(
            address(this),
            buyer[_id],
            _id
        );
    }

    function cancelSale(uint _id) public {
        require(isListed[_id], "Sale not found");

        if (inspectionPassed[_id] == false) {
            payable(buyer[_id]).transfer(depositedAmount[_id]);
        } else {
            payable(seller).transfer(depositedAmount[_id]);
        }

        isListed[_id] = false;
    }
}

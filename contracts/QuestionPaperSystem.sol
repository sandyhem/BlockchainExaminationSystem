// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract QuestionPaperSystem {
    enum PaperStatus {
        REQUESTED,
        UPLOADED,
        VERIFIED
    }
    enum Role {
        Teacher,
        Superintendent,
        Center
    }

    struct User {
        string name;
        Role role;
        string email;
        string contactNumber;
        bool exists;
        bool isActive;
    }

    struct Paper {
        address teacher;
        string fileCID;
        string keyCID;
        string ExamId;
        string ExamName;
        string Subject;
        PaperStatus status;
        bool exists;
    }

    struct Access {
        bool granted;
        uint256 startTime;
        uint256 endTime;
    }
    struct AccessLog {
            address user;
            uint256 paperId;
            bool success;
            string reason;
            uint256 timestamp;
        }

    // State Variables
    address public Coe;
    mapping(address => User) public users;
    mapping(uint256 => Paper) public papers;
    mapping(uint256 => mapping(address => Access)) public accessControl;

    uint256 public paperCount;
    address[] private userAddresses;
    AccessLog[] public accessLogs;

    // Events
    event UserRegistered(
        address indexed user,
        string name,
        Role role,
        bool success
    );
    event UserDeactivated(address indexed user);
    event PaperRequested(uint256 indexed paperId, address indexed teacher);
    event PaperUploaded(
        uint256 indexed paperId,
        address indexed teacher,
        string fileCID,
        string keyCID
    );
    event AccessGranted(
        uint256 indexed paperId,
        address indexed user,
        uint256 startTime,
        uint256 endTime
    );
    event AccessRevoked(uint256 indexed paperId, address indexed user);
    event PaperAccessAttempt(
        address indexed user,
        uint256 paperId,
        bool success,
        string reason
    );

    // Modifiers
    modifier onlyOwner() {
        require(
            msg.sender == Coe,
            "Only contract owner can perform this this action"
        );
        _;
    }

    modifier onlyTeacher() {
        require(
            users[msg.sender].exists &&
                users[msg.sender].role == Role.Teacher &&
                users[msg.sender].isActive,
            "Only active teachers can perform this action"
        );
        _;
    }

    modifier onlyAuthorized(uint256 _paperId) {
        require(
            msg.sender == Coe ||
                (accessControl[_paperId][msg.sender].granted &&
                    block.timestamp >=
                    accessControl[_paperId][msg.sender].startTime &&
                    block.timestamp <=
                    accessControl[_paperId][msg.sender].endTime),
            "Access denied"
        );
        _;
    }

    // Constructor
    constructor() {
        Coe = msg.sender;
    }

    // Functions
    function registerUser(
        address _userAddress,
        string memory _name,
        Role _role,
        string memory _email,
        string memory _contactNumber
    ) external onlyOwner {
    if (users[_userAddress].exists) {
        require(!users[_userAddress].isActive, "User already exists");

        // Reactivate the user
        users[_userAddress].isActive = true;
        emit UserRegistered(_userAddress, _name, _role, true);
        return;
    }
        users[_userAddress] = User(
            _name,
            _role,
            _email,
            _contactNumber,
            true,
            true
        );
        userAddresses.push(_userAddress);
        emit UserRegistered(_userAddress, _name, _role, true);
    }

    function deactivateUser(address _userAddress) external onlyOwner {
        require(users[_userAddress].exists, "User not found");
        require(users[_userAddress].isActive, "User already deactivated");
        users[_userAddress].isActive = false;
        emit UserDeactivated(_userAddress);
    }

    function createPaperRequest(
        address _teacher,
        string memory _keyCID,
        string memory _ExamId,
        string memory _ExamName,
        string memory _Subject
    ) external onlyOwner {
        require(
            users[_teacher].exists &&
                users[_teacher].role == Role.Teacher &&
                users[_teacher].isActive,
            "Invalid or inactive teacher"
        );
        paperCount++;
        papers[paperCount] = Paper(
            _teacher,
            "",
            _keyCID,
            _ExamId,
            _ExamName,
            _Subject,
            PaperStatus.REQUESTED,
            true
        );
        emit PaperRequested(paperCount, _teacher);
    }

    function uploadPaper(
        uint256 _paperId,
        string memory _fileCID
    ) external onlyTeacher {
        require(papers[_paperId].exists, "Invalid paper");
        require(papers[_paperId].teacher == msg.sender, "Not assigned teacher");
        require(
            bytes(papers[_paperId].fileCID).length == 0,
            "Paper already uploaded"
        );

        papers[_paperId].fileCID = _fileCID;
        papers[_paperId].status = PaperStatus.UPLOADED;

        emit PaperUploaded(
            _paperId,
            msg.sender,
            _fileCID,
            papers[_paperId].keyCID
        );
    }

    function grantAccess(
        uint256 _paperId,
        address _user,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(papers[_paperId].exists, "Invalid paper");
        require(
            users[_user].exists && users[_user].isActive,
            "Invalid or inactive user"
        );
        require(
            papers[_paperId].status == PaperStatus.UPLOADED,
            "Paper not uploaded"
        );

        accessControl[_paperId][_user] = Access(true, _startTime, _endTime);
        emit AccessGranted(_paperId, _user, _startTime, _endTime);
    }

    function revokeAccess(uint256 _paperId, address _user) external onlyOwner {
        require(accessControl[_paperId][_user].granted, "No active access");
        accessControl[_paperId][_user].granted = false;
        emit AccessRevoked(_paperId, _user);
    }

    function hasAccess(
        uint256 _paperId,
        address _user
    ) external view returns (bool, uint256, uint256) {
         require(papers[_paperId].exists, "Invalid paper");
        require(
            users[_user].exists && users[_user].isActive,
            "Invalid or inactive user"
        );
         Access memory access = accessControl[_paperId][_user];
    bool valid = access.granted &&
                 block.timestamp >= access.startTime &&
                 block.timestamp <= access.endTime;
    return (valid, access.startTime, access.endTime);
    }

    // function getPaper(
    //     uint256 _paperId
    // )
    //     external
    //     view
    //     onlyAuthorized(_paperId)
    //     returns (string memory fileCID, string memory keyCID)
    // {
    //     require(papers[_paperId].exists, "Invalid paper");
    //     Paper memory paper = papers[_paperId];
    //     return (paper.fileCID, paper.keyCID);
    // }


    function getPaper(
        uint256 _paperId
    ) external returns (string memory fileCID, string memory keyCID, string memory ExamId, string memory ExamName,string memory Subject, uint8 status) {
     
        if (!papers[_paperId].exists) {
            emit PaperAccessAttempt(
                msg.sender,
                _paperId,
                false,
                "Invalid paper ID"
            );
            // accessLogs.push(AccessLog(msg.sender, _paperId, false, "Invalid paper", currentTimestamp, currentBlock));
            revert("Invalid paper");
        }

        if (
            !(msg.sender == Coe ||
                (accessControl[_paperId][msg.sender].granted &&
                    block.timestamp >=
                    accessControl[_paperId][msg.sender].startTime &&
                    block.timestamp <=
                    accessControl[_paperId][msg.sender].endTime))
        ) {
            //  accessLogs.push(AccessLog(msg.sender, _paperId, false, "Access denied", currentTimestamp, currentBlock));
            emit PaperAccessAttempt(
                msg.sender,
                _paperId,
                false,
                "Access denied"
            );
               // Store the log for access denial
            revert("Access denied");
        }

        Paper memory paper = papers[_paperId];
        emit PaperAccessAttempt(msg.sender, _paperId, true, "Access granted");
        // accessLogs.push(AccessLog(msg.sender, _paperId, true, "Access granted", currentTimestamp, currentBlock));
        return (paper.fileCID, paper.keyCID, paper.ExamId,paper.ExamName, paper.Subject, uint8(paper.status));
    }

    function getAccessLogs() external view returns (AccessLog[] memory) {
        return accessLogs;
    }
         //   address user;
    //         uint256 paperId;
    //         bool success;
    //         string reason;
    //         uint256 timestamp;
    function setAccessLogs(uint256 paperId, bool success, string memory reason, uint256 timestamp) external {
        AccessLog memory log = AccessLog(msg.sender, paperId, success, reason, timestamp);
        accessLogs.push(log);
    }
    function getAllPapers() external view returns (Paper[] memory) {
        Paper[] memory result = new Paper[](paperCount);
        for (uint256 i = 1; i <= paperCount; i++) {
            if (papers[i].exists) {
                result[i - 1] = papers[i];
            }
        }
        return result;
    }

    function getAllUsers()
        external
        view
        returns (address[] memory, User[] memory)
    {
        uint256 count = userAddresses.length;
        User[] memory result = new User[](count);
        address[] memory addresses = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            addresses[i] = userAddresses[i];
            result[i] = users[userAddresses[i]];
        }
        return (addresses, result);
    }
}

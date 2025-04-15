// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract DirectStorage {
    struct FileData {
        string fileName;
        bytes fileContent;
        address uploader;
        uint256 timestamp;
    }

    FileData[] public files;

    function uploadFile(string memory name, bytes memory content) public {
        files.push(FileData(name, content, msg.sender, block.timestamp));
    }

    function getFile(uint256 index) public view returns (FileData memory) {
        require(index < files.length, "Invalid index");
        return files[index];
    }
}

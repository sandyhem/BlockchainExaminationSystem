import Web3 from 'web3';
import { useEffect, useState } from 'react';
import QuestionPaperSystem from '../../contracts/QuestionPaperSystem.json';

const useAccessLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = QuestionPaperSystem.networks[networkId];

      const contract = new web3.eth.Contract(
        QuestionPaperSystem.abi,
        deployedNetwork.address
      );

      // Get past events
      const pastEvents = await contract.getPastEvents('PaperAccessAttempt', {
        fromBlock: 0,
        toBlock: 'latest'
      });

      const pastFormatted = await Promise.all(
        pastEvents.map(async (e) => {
          const block = await web3.eth.getBlock(e.blockNumber);
          const timestamp = new Date(Number(block.timestamp) * 1000).toLocaleString();

          return {
            user: e.returnValues.user,
            paper: e.returnValues.paperId.toString(),
            success: e.returnValues.success,
            reason: e.returnValues.reason,
            blockNumber: e.blockNumber.toString(),
            txHash: e.transactionHash,
            time: timestamp
          };
        })
      );

      setLogs(pastFormatted.reverse());

      // Listen for future events
      contract.events.PaperAccessAttempt({
        fromBlock: 'latest'
      }).on('data', async (event) => {
        const block = await web3.eth.getBlock(event.blockNumber);
        const timestamp = new Date(Number(block.timestamp) * 1000).toLocaleString();

        const entry = {
          user: event.returnValues.user,
          paper: event.returnValues.paperId.toString(),
          success: event.returnValues.success,
          reason: event.returnValues.reason,
          blockNumber: event.blockNumber.toString(),
          txHash: event.transactionHash,
          time: timestamp
        };

        setLogs(prev => [entry, ...prev]);
        console.log("New log added:", entry);
      });
    };

    loadLogs();
  }, []);

  return logs;
};

export default useAccessLogs;

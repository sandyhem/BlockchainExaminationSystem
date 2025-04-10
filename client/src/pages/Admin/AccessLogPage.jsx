import React from 'react';
import useAccessLogs from './UserAccessLogs';

const AccessLogPage = () => {
  const logs = useAccessLogs();

  // Remove duplicates based on all fields matching
  const uniqueLogs = logs.filter((log, index, self) =>
    index === self.findIndex(
      (l) =>
        // l.paperId === log.paperId &&
        l.name === log.name &&
        l.user === log.user &&
        l.success === log.success &&
        l.reason === log.reason &&
        l.timestamp === log.timestamp
    )
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📋 Access Logs</h2>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">User</th>
            <th className="p-2">Transaction</th>
            <th className="p-2">Block</th>
            <th className="p-2">Timestamp</th>
            <th className="p-2">Reason</th>
            {/* <th className="p-2">Paper</th> */}
          </tr>
        </thead>
        <tbody>
          {uniqueLogs.map((log, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{log.user}</td>
              <td className="p-2">
                {log.success ? (
                  <span className="text-green-600 font-semibold">Success</span>
                ) : (
                  <span className="text-red-600 font-semibold">Failed</span>
                )}
              </td>
              <td className="p-2">{log.blockNumber}</td>
              <td className="p-2">{log.time}</td>
              <td className="p-2">{log.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccessLogPage;

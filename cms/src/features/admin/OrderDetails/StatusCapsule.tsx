import React, { ReactNode } from 'react';

const StatusCapsule: React.FC<{
  status: 'SENT' | 'WAITING' | 'PROCESSED' | 'CANCELLED' | 'CONFIRMED';
}> = ({ status }) => {
  let capsule: ReactNode;
  switch (status) {
    case 'SENT':
      capsule = (
        <div className="text-blue-600 bg-blue-200 rounded-full font-semibold py-0.5 px-5">
          Sent
        </div>
      );
      break;
    case 'WAITING':
      capsule = (
        <div className="text-yellow-600 bg-yellow-200 rounded-full font-semibold py-0.5 px-5">
          Pending
        </div>
      );
      break;
    case 'PROCESSED':
      capsule = (
        <div className="text-yellow-600 bg-yellow-200 rounded-full font-semibold py-0.5 px-5">
          Processed
        </div>
      );
      break;
    case 'CANCELLED':
      capsule = (
        <div className="text-red-600 bg-red-200 rounded-full font-semibold py-0.5 px-5">
          Cancelled
        </div>
      );
      break;
    case 'CONFIRMED':
      capsule = (
        <div className="text-green-600 bg-green-200 rounded-full font-semibold py-0.5 px-5">
          Confirmed
        </div>
      );
      break;
  }
  return capsule;
};

export default StatusCapsule;

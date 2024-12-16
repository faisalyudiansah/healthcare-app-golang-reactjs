import React, { ReactNode, useEffect, useState } from 'react';
import { IoChevronForward, IoChevronBack } from 'react-icons/io5';

const PaginationButtons: React.FC<{
  totalPage: number;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
}> = ({ totalPage, pageNumber, setPageNumber }) => {
  const clickNumButton = (num: number) => () => {
    console.log('>>', num);
    setPageNumber(num);
  };
  const clickSmallestButton = () => {
    setPageNumber(1);
  };

  const clickLargestButton = () => {
    setPageNumber(totalPage);
  };

  const [multiplier, setMultiplier] = useState(1);

  const [isShowingFromLargest, setIsShowingFromLargest] = useState(false);

  useEffect(() => {
    if (pageNumber === 1) return;
    if (pageNumber === totalPage) return;

    if (!isShowingFromLargest) {
      if (pageNumber > 4 * multiplier) {
        setMultiplier((prev) => prev + 1);
        return;
      }
      if (pageNumber === 4 * (multiplier - 1)) {
        setMultiplier((prev) => prev - 1);
      }
    } else {
      if (pageNumber === totalPage + 1 - 4 * (multiplier - 1)) {
        setMultiplier((prev) => prev - 1);
        return;
      }

      if (pageNumber === totalPage - 4 * multiplier) {
        setMultiplier((prev) => prev + 1);
      }
    }
  }, [pageNumber]);

  useEffect(() => {
    if (pageNumber === 1) {
      setIsShowingFromLargest(false);
    } else if (pageNumber === totalPage) {
      setIsShowingFromLargest(true);
    }
  }, [pageNumber]);

  useEffect(() => {
    setMultiplier(1);
  }, [isShowingFromLargest]);

  let paginationButtons: ReactNode;
  if (totalPage > 5) {
    if (!isShowingFromLargest) {
      paginationButtons = (
        <>
          {[...Array(4).keys()]
            .map((num) => num + 1)
            .map((num) => (multiplier - 1) * 4 + num)
            .map((num) => (
              <button
                className={`pagination-btn ${num === pageNumber && 'active'}`}
                type="button"
                key={num}
                onClick={clickNumButton(num)}
              >
                {num}
              </button>
            ))}
          <div className="font-bold tracking-widest text-slate-600">. . .</div>
          <button
            className="pagination-btn"
            type="button"
            onClick={clickLargestButton}
          >
            {totalPage}
          </button>
        </>
      );
    } else if (isShowingFromLargest) {
      paginationButtons = (
        <>
          <button
            className="pagination-btn"
            type="button"
            onClick={clickSmallestButton}
          >
            1
          </button>
          <div className="font-bold tracking-widest text-slate-600">. . .</div>
          {[...Array(4).keys()]
            .map((num) => totalPage - (4 - num - 1))
            .map((num) => num - (multiplier - 1) * 4)
            .map((num) => (
              <button
                className={`pagination-btn ${num === pageNumber && 'active'}`}
                type="button"
                key={num}
                onClick={clickNumButton(num)}
              >
                {num}
              </button>
            ))}
        </>
      );
    }
  } else {
    paginationButtons = [...Array(totalPage).keys()]
      .map((num) => num + 1)
      .map((num) => (
        <button
          className={`pagination-btn ${num === pageNumber && 'active'}`}
          type="button"
          key={num}
          onClick={clickNumButton(num)}
        >
          {num}
        </button>
      ));
  }
  return (
    <>
      <button
        className="pagination-prev-btn"
        type="button"
        onClick={() => {
          if (pageNumber === 1) return;
          setPageNumber((prev) => prev - 1);
        }}
      >
        <IoChevronBack />
      </button>

      {paginationButtons}

      <button
        className="pagination-next-btn"
        type="button"
        onClick={() => {
          if (pageNumber === totalPage) return;
          setPageNumber((prev) => prev + 1);
        }}
      >
        <IoChevronForward />
      </button>
    </>
  );
};

export default PaginationButtons;

/*
1080 1081 1082 1083
1076 1077 1078 1079
*/

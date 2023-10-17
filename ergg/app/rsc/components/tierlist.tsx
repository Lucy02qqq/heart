'use client'

import { useEffect, useRef, useState } from "react";
import { endOptions, scrollbarStyles, sortStandard, startOptions, updateEndDisable, updateStartDisable } from "../libs/assets";
import { Data, getListforTiergroup } from "../libs/refactor";
import ReactSelect from "react-select";
import TierItem from "./tieritem";
import { includesByCho } from "hangul-util";
import HeadPart from "./headpart";

export default function TierList({ data }: any) {
  // data >> refactor속 parsedData에 쓰이는 원시형 , charList >> 가공형
  // 리스트에 표현되는 것들로만 만든 리스트가 필요하다. 전체데이터 포함된걸로 할려니까 너무 느림
  const existTg = typeof window !== "undefined" && sessionStorage.getItem("tierGroup") !== undefined ? JSON.parse(sessionStorage.getItem("tierGroup")!) : [5, 1];
  
  // 지금 이 TierList Component 자체가 SSR로 한번 Generate 되어서 클라이언트로 내려오는데 그때 이 TierGroups 값이 [5,1] 이 됨 (typeof window 에 걸려서)
  // 근데 그렇게 내려온 페이지를 다시 클라이언트 사이드 Hydrate 시 다른 TierGroups 값이 배정되면서 Hydration 에러가 발생.

  const tierGroups = useRef(existTg);
  const [charList, setCharList] = useState<Array<any>>(getListforTiergroup(data, tierGroups.current[0], tierGroups.current[1]).sort(sortStandard.np));
  const searchBase = useRef(charList);

  useEffect(() => {
    sortStandard.current === undefined ? sortStandard.current = sortStandard.np : null;
    sessionStorage.setItem("tierGroup", JSON.stringify(tierGroups.current));
    updateEndDisable(tierGroups.current[0]);
    updateStartDisable(tierGroups.current[1]);
    setAverage();
  }, [])

  return (
    <div className="flex flex-col h-fill w-full overflow-x-hidden overflow-y-auto scrollbar-hide gap-y-2">
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-row items-end">
          <ReactSelect
            className="w-[150px]"
            isSearchable={false}
            options={startOptions}
            styles={scrollbarStyles}
            defaultValue={startOptions[8 - tierGroups.current[0]]}
            onChange={(e) => { // .sort(sortStandard[1])
              const newList = getListforTiergroup(data, e!.value!, tierGroups.current[1]).sort(sortStandard.current);
              setCharList(newList);
              searchBase.current = newList;
              tierGroups.current[0] = e!.value!;
              updateEndDisable(tierGroups.current[0]);
              sessionStorage.setItem("tierGroup", JSON.stringify(tierGroups.current));
              setAverage()
            }} />
          <div className="text-base font-msb ml-2">
            부터
          </div>
        </div>
        <div className="flex flex-row items-end">
          <ReactSelect
            className="w-[150px]"
            isSearchable={false}
            options={endOptions}
            styles={scrollbarStyles}
            defaultValue={endOptions[8 - tierGroups.current[1]]}
            onChange={(e) => { // 이상한 조건일때 ex) 이터부터 다이아까지 안되게 해야함
              const newList = getListforTiergroup(data, tierGroups.current[0], e!.value!).sort(sortStandard.current);
              setCharList(newList);
              searchBase.current = newList;
              tierGroups.current[1] = e!.value!;
              updateStartDisable(tierGroups.current[1]);
              sessionStorage.setItem("tierGroup", JSON.stringify(tierGroups.current));
              setAverage()
            }} />
          <div className="text-base font-msb ml-2">
            까지
          </div>
        </div>
        <div className="flex items-center w-[150px] h-full border-b border-slate-500 ml-2">
          <input
            className="appearance-none bg-transparent text-right border-none w-full h-full text-gray-700 mr-2 text-sm leading-tight focus:outline-none"
            type="text"
            placeholder="실험체 검색(초성) >>"
            onChange={(e) => {
              if (e.target.value === "") {
                setCharList(searchBase.current);
              } else {
                setCharList(searchBase.current.filter((element) => includesByCho(e.target.value.replace(" ", ""), element.weapon + element.name)));
              }
            }} />
        </div>
      </div>
      <TierHead />
      <div className="flex flex-col h-full w-full gap-y-2 overflow-scroll scrollbar-hide">
        {charList.map((char, p) => (
          <TierItem key={p} char={char} position={p} tierGroup={tierGroups.current} />))}
      </div>
    </div>
  )

  function TierHead() {

    return (
      <div className="flex flex-row relative min-w-full min-h-[40px] items-center rounded py-1 bg-neutral-700">
        <div className="w-[10%] text-center text-base border-r border-white text-white font-msb">순위</div>
        <div id="sort_by_abc" className="w-[30%] text-center border-r text-base border-white text-white font-msb">구분</div>
        <HeadPart sortFunc={compareAndSort} sortBy={sortStandard.wr} text="승률"/>
        <HeadPart sortFunc={compareAndSort} sortBy={sortStandard.pr} text="픽률" />
        <HeadPart sortFunc={compareAndSort} sortBy={sortStandard.sr} text="순방률" />
        <HeadPart sortFunc={compareAndSort} sortBy={sortStandard.ag} text="평순" />
        <HeadPart isLast={true} sortFunc={compareAndSort} sortBy={sortStandard.np} text="티어" />
      </div>
    );
  }

  function compareAndSort(newStandard: any) {
    if (sortStandard.current == newStandard) {
      setCharList([...charList].reverse())
      searchBase.current.reverse();
    } else {
      setCharList([...charList].sort(newStandard));
      sortStandard.current = newStandard;
      searchBase.current.sort(newStandard);
    }
  }

  function setAverage() {
    // '평딜', '픽률', '평순', '순방률', '평킬', '승률' 순임
    let entireAvgDeal = 0;
    let entireAvgGrade = 0;
    let entireTK = 0;
    let entireSB = 0;
    let entirePR = 0;
    let entireWR = 0;

    let counts = 0;
    charList.map((char: Data, p: number) => {
      entireAvgDeal += char.data?.avgdealbygrade[0]!;
      entireAvgGrade += char.data?.avggrade!;
      entireTK += char.data?.tkbygrade[0]!;
      entireSB += char.SR;
      entirePR += char.PR;
      entireWR += char.WR;

      counts++;
    });

    typeof window !== 'undefined' ? sessionStorage.setItem("average", JSON.stringify([entireAvgDeal / counts, entirePR / counts, entireAvgGrade / counts, entireSB / counts, entireTK / counts, entireWR / counts])) : null;
  }
}


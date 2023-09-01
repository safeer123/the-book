import styled from "styled-components";
import Search from "./search";
import Results from "./results";
import { useState } from "react";
import { Selection } from "../types";

const Wrapper = styled.div`
  padding: 16px;
  height: calc(100% - 32px);
`;

const PageHeader = styled.div`
  margin: 16px;
`;

const Content = styled.div`
  margin: 16px;
  text-align: right;
  max-height: calc(100% - 72px);
  overflow-y: auto;
`;



const SuraList = () => {

  const [selection, setSelection] = useState<Selection>({});

  return (
    <Wrapper>
      <PageHeader>
        <Search setSelection={setSelection}/>
      </PageHeader>
      <Content className="scrollable">
          <Results chapters={selection?.chapters} verses={selection?.verses}/>
      </Content>
    </Wrapper>  
  );
};

export default SuraList;

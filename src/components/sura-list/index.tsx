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
  border-top: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  border-radius: 8px;
`;



const SuraList = () => {

  const [selection, setSelection] = useState<Selection>({});

  return (
    <Wrapper>
      <PageHeader>
        <Search setSelection={setSelection}/>
      </PageHeader>
      <Content>
          <Results chapters={selection?.chapters}/>
      </Content>
    </Wrapper>  
  );
};

export default SuraList;

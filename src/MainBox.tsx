import React from 'react';
import kuromoji from "kuromoji"

interface MainBoxState {
  orgText: string;
  cnvText: string;
  tokenizer?: kuromoji.Tokenizer<kuromoji.IpadicFeatures>
}

function toKatanana(str: string) {
    return str.replace(/[\u30a1-\u30f6]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

function toIndex(surface: string, pron: string, tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>): number[] | undefined {
  let si = 0;
  let pi = 0;
  
  //まず全部にindexを対応付ける
  const orgindexs = [];
  while(si < surface.length && pi < pron.length) {
    if(surface[si].match(/ぁ-んー/)) {
      if(toKatanana(surface[si]) === pron[pi]) {
        orgindexs.push(si);
        si ++;
        pi ++;
        continue;
      }
      break;
    }
    
    if(surface[si].match(/ァ-ヶー/)) {
      if(surface[si] === pron[pi]) {
        orgindexs.push(si);
        si ++;
        pi ++;
        continue;
      }
      break;
    }
    
    const tks = tokenizer.tokenize(surface[si]);
    const syomi = tks.map(t => t.pronunciation || "").join("");
    let sii = 0;
    let ng = false;
    while(true) {
      if(syomi[sii] !== pron[pi]) {
        ng = true;
        break;
      }
      orgindexs.push(si);
      
      sii++;
      pi++;
      if(sii >= syomi.length) {        
        break;
      }
      if(pi >= pron.length) {
        ng = true;
        break;
      }
    }
    
    if(ng) break;
    
    si++;
  }  
  
  if(orgindexs.length === pron.length) {
    return orgindexs;
  } else {
    return undefined;
  }
}

function convertToQiitaSub(surface: string, pron: string, tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>) : string | undefined {
  //読みが「きた」，「きいた」であるものを変換
  if(pron === 'キタ' || pron === 'キイタ') {
    return 'Qiita';
  }
  
  //それ以外
  const orgIndex = toIndex(surface, pron, tokenizer);
  if(orgIndex) {
    let qitaI = pron.indexOf('キタ');
    let qitaE = qitaI + 1;
    if(qitaI === -1) {
      qitaI = pron.indexOf('キイタ');
      qitaE = qitaI + 2;
    }
    
    if(qitaI !== -1) {
      //match
      //
      if((qitaI === 0 || orgIndex[qitaI - 1] !== orgIndex[qitaI]) &&
        (qitaE === orgIndex.length - 1 || orgIndex[qitaE + 1] !== orgIndex[qitaE])) {
        return surface.substring(0, orgIndex[qitaI]) + "Qiita" + (qitaE === orgIndex.length - 1 ? '' : surface.substring(orgIndex[qitaE + 1]));
      }
    }
  }
  
  return undefined;
}

function convertToQiita(tokens: kuromoji.IpadicFeatures[], tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>) : string {
  let results : string[] = [];
  
  for(let i=0; i<tokens.length; i++) {
    const token = tokens[i];
    const c1 = convertToQiitaSub(token.surface_form, token.pronunciation || "", tokenizer);
    if(c1 !== undefined) {
      results.push(c1);
      continue;
    }
    
    if(i < tokens.length - 1 && token.pronunciation !== undefined && tokens[i+1].pronunciation !== undefined) {
      const comb = token.pronunciation + tokens[i+1].pronunciation;
      const c2 = convertToQiitaSub(token.surface_form + tokens[i+1].surface_form, comb, tokenizer);
      if(c2 !== undefined) {
        results.push(c2);
        i++;
        continue;
      }
    }
    
    const toAdd = token.surface_form;
    results.push(toAdd);
  }
  
  return results.join("").replace(/きた|きいた|キタ|キイタ/, 'Qiita');
}

class MainBox extends React.Component<{}, MainBoxState> {
  constructor(props : {}) {
    super(props);
    
    this.state = {
      orgText: "今北産業\n\n話を聞いた",
      cnvText: "(初期化中...)",
      tokenizer: undefined
    };
  }
  
  componentDidMount = () => {
    kuromoji.builder({ dicPath: "/dict" }).build((err, tokenizer) => {
      if(err){
        console.log(err);
      } else {
        const tokens = tokenizer.tokenize(this.state.orgText);
        console.log(tokens);
        const cnvText = convertToQiita(tokens, tokenizer);
        this.setState({cnvText: cnvText, tokenizer: tokenizer});
      }
    });
  }
  
  handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ orgText: event.target.value });
    if(this.state.tokenizer !== undefined) {
      const tokens = this.state.tokenizer.tokenize(event.target.value);
      console.log(tokens);
      const cnvText = convertToQiita(tokens, this.state.tokenizer);
      this.setState({ cnvText: cnvText });
    }
  }
  
  render() {
    return (
      <div>
        <div>変換元:</div>
        <textarea value={this.state.orgText} onChange={this.handleChange} style={{width: "700px", height: "200px"}} />
        <div style={{fontSize: "30px"}}>　　⬇</div>
        <div>変換後:</div>
        <textarea value={this.state.cnvText} style={{width: "700px", height: "200px"}} readOnly />
      </div>
    );
  }
}

export default MainBox;

import kuromoji from 'kuromoji';

let tokenizer = null;

export const initTokenizer = () => {
  return new Promise((resolve, reject) => {
    if (tokenizer) {
      resolve(tokenizer);
      return;
    }

    kuromoji.builder({ dicPath: '/dict' }).build((err, _tokenizer) => {
      if (err) {
        reject(err);
      } else {
        tokenizer = _tokenizer;
        resolve(tokenizer);
      }
    });
  });
};

export const tokenizeText = async (text) => {
  if (!tokenizer) {
    await initTokenizer();
  }
  
  const tokens = tokenizer.tokenize(text);
  
  return tokens.map(token => ({
    text: token.surface_form,
    reading: token.reading || token.surface_form,
    baseForm: token.basic_form,
    pos: token.pos,
    posDetail: token.pos_detail_1
  }));
};

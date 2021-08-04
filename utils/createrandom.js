// function creates a random string
const createrandom = () => {
  let randomStr = "";
  const str =
    "1,2,3,4,5,6,7,8,9,0,q,w,e,r,t,y,u,i,o,p,x,c,v,b,n,A,W,R,R,Y,U,I,O";
  const randSrt = str.split(",");

  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.floor(Math.random() * randSrt.length);
    randomStr += randSrt[randomNumber];
  }
  return randomStr;
};

module.exports = {
  createrandom,
};

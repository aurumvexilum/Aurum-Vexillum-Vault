export type TokenLike={symbol:string;contract:string;precision:number};
export type TransferRequest={from:string;to:string;token:TokenLike;amount:string;memo:string};
const ACCOUNT=/^[a-z1-5.]{1,12}$/;
export function validateTransfer(request:TransferRequest){const errors:string[]=[];if(!ACCOUNT.test(request.from))errors.push("Invalid sender account.");if(!ACCOUNT.test(request.to))errors.push("Invalid recipient account.");if(request.from===request.to)errors.push("Sender and recipient must differ.");if(!new RegExp(`^\\d+(\\.\\d{1,${request.token.precision}})?$`).test(request.amount)||Number(request.amount)<=0)errors.push("Invalid positive amount.");if(request.memo.length>256)errors.push("Memo exceeds 256 characters.");if(!request.token.contract||!request.token.symbol)errors.push("Token contract is required.");return errors}
export function assertTransfer(request:TransferRequest){const errors=validateTransfer(request);if(errors.length)throw new Error(errors.join(" "))}

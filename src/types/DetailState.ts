// import { States } from "../enums/States"
// import ExpenseDetails from "./ExpenseDetails"
// import PurchaseDetails from "./PurchaseDetails"
// export default abstract class DetailState {
//   context: ExpenseDetails | PurchaseDetails
//   state: States

//   constructor(context: ExpenseDetails | PurchaseDetails, state: States) {
//     this.context = context
//     this.state = state
//   }

//   public getContext(): ExpenseDetails | PurchaseDetails {
//     return this.context
//   }
//   public setContext(context: ExpenseDetails | PurchaseDetails) {
//     this.context = context
//   }
//   public getState(): string {
//     return this.state
//   }
//   public setState(state: States) {
//     this.state = state
//   }
// }


// export class CreateDetail extends DetailState {
//   constructor(context: ExpenseDetails | PurchaseDetails) {
//     super(context, States.CREATE)
//   }
// }

// export class DeleteDetail extends DetailState {
//   constructor(context: ExpenseDetails | PurchaseDetails) {
//     super(context, States.DELETE)
//   }
// }

// export class PatchDetail extends DetailState {
//   constructor(context: ExpenseDetails | PurchaseDetails) {
//     super(context, States.PATCH)
//   }
// }

// export class PutDetail extends DetailState {
//   constructor(context: ExpenseDetails | PurchaseDetails) {
//     super(context, States.PUT)
//   }
// }

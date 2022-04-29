import mongoose from "mongoose";

export default interface IDistance{
  scanId: mongoose.Schema.Types.ObjectId,
  distance: number
}
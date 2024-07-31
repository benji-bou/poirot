import { useEffect, useState } from "react";
import { Intel, NewIntel } from "../../models/Intel";
import TextField from "@mui/material/TextField";

interface IntelFormProp {
  onChange?: (intel?: Intel) => void
  initial?: Intel
}

export default function IntelForm({ onChange, initial = undefined }: IntelFormProp) {
  return <>
    <TextField
      required
      id="outlined-required"
      label="Value"
      value={initial?.content ?? ""}
      onChange={(value) => {
        const updatedIntel = initial ?? NewIntel(value?.target.value)
        updatedIntel.content = value?.target.value
        onChange?.(updatedIntel)
      }}
    />
  </>
}
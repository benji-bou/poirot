import { ReactNode } from "react";
import { Intel, IntelInput, IntelType, IntelTypeIndex } from "../../../models/Intel";
import List from "@mui/material/List";
import { URLIntelContent } from './URLIntelContent'
import { Chip, ListItem, Stack } from "@mui/material";



export interface IntelContentProp {
  intel: Intel
}

export function IntelContent({ intel }: IntelContentProp): ReactNode {
  const iT = Object.values(intel.type)

  const isUrl = intel.type?.indexOf("url") != -1

  return (<>
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        {iT.map((i) => {
          return <Chip key={i} label={i} />;
        })}
      </Stack>
      {isUrl ? <a href={intel.content} target="_blank">{intel.content}</a> : intel.content}

      <List>
        {iT.map((i) => <ListItem key={i}>
          <IntelContentFromType currentType={i} intel={intel} />
        </ListItem>)}
      </List>
    </Stack>
  </>)
}

export function IntelContentFromType({ intel, currentType }: IntelContentProp & { currentType: string }): ReactNode {
  switch (currentType) {
    case IntelType.NAME:
      return <DefaultContent intel={intel} />
    case IntelType.LOGIN:
      return <DefaultContent intel={intel} />
    case IntelType.PASSWORD:
      return <DefaultContent intel={intel} />
    case IntelType.EMAIL:
      return <DefaultContent intel={intel} />
    case IntelType.DATE:
      return <DefaultContent intel={intel} />
    case IntelType.URL:
      return <URLIntelContent url={intel.content}></ URLIntelContent>
    case IntelType.DOMAIN:
      return <DefaultContent intel={intel} />
    case IntelType.POSTAL:
      return <DefaultContent intel={intel} />
    case IntelType.ADDRESS:
      return <DefaultContent intel={intel} />
    case IntelType.PHONE:
      return <DefaultContent intel={intel} />
    case IntelType.CUSTOM:
      return <DefaultContent intel={intel} />
    case IntelType.IMAGE:
      return <MediaContent intel={intel} />
    default:
      return <DefaultContent intel={intel} />
  }

}


export function DefaultContent({ intel }: IntelContentProp) {

  return <>

  </>
}


export function MediaContent({ intel }: IntelContentProp) {
  return <>
    <img src={intel?.content}></img>
  </>
}
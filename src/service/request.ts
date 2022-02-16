import request, { Options } from "request";
import { DATATYPE } from "../lib/Datatype";

interface requestProp {
  path: "manga/" | "at-home/server/" | "chapter/";
  query: string;
  id?: string;
}

export async function getRequest(props: requestProp): Promise<any> {
  const options: Options = {
    method: "GET",
    url: `${DATATYPE.URL}${props.path}${props.id ? props.id : ""}?${
      props.query
    }`,
  };

  const res = new Promise((call) => {
    request(options, function (err, res) {
      if (err) throw new err();
      const json = res.toJSON();

      if (json.statusCode === 200) {
        call(JSON.parse(json.body));
      }
    });
  });

  return res;
}

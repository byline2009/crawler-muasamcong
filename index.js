const { render } = require("ejs");
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.listen(3002);
var request = require("request");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
var async = require("async");
var _ = require("lodash");
var sum = 0;
var tasks = {};
var bodyJson = {};

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function callback(error, response, body, cb) {
  if (error || response.statusCode != 200 || !isJson(body)) return cb(true);
  if (isJson(body)) {
    bodyJson = JSON.parse(body);
    cb(null, bodyJson); //instead of sending data directly to view, send it to async callback to merge it latter
  }
}
app.get("/check", async (req, res) => {
  // res.render("views/trangchu");

  [0].map((item, index) => {
    request.post(
      {
        headers: { "content-type": "application/json" },
        url: "https://muasamcong.mpi.gov.vn/o/egp-portal-contractor-selection-v2/services/smart/search",
        body: `
    [{"pageSize":50,"pageNumber":${index},"query":[{"index":"es-contractor-selection",
    "keyWord":"Hệ thống truyền thanh, Mua sắm thiết bị, lắp đặt thiết bị, thiết bị truyền thanh, Hệ thống nguồn, Hệ thống thông tin nguồn, Truyền thanh thông minh, Du lịch thông minh, Truyền dẫn, Phân mềm, cung cấp thiết bị",
    "matchType":"any-1","matchFields":["notifyNo","bidName"],
    "filters":[{"fieldName":"publicDate","searchType":"range","from":"2023-12-01T00:00:00.000Z","to":null},
    {"fieldName":"investField","searchType":"in","fieldValues":["HH","XL"]},{"fieldName":"type","searchType":"in","fieldValues":["es-notify-contractor"]},
    {"fieldName":"caseKHKQ","searchType":"not_in","fieldValues":["1"]},{"fieldName":"isInternet","searchType":"in","fieldValues":[1]},
    {"fieldName":"bidCloseDate","searchType":"range",
    "from":"2024-01-30T14:42:49.625Z","to":null}]}]}]
    `,
        timeout: 50000,
        accept: "application/json",
      },
      function (error, response, body) {
        if (body) {
          console.log("check");
          bodyJson = JSON.parse(body);
          // console.log("body1", bodyJson);
          if (bodyJson && bodyJson.page && bodyJson.page.content) {
            bodyJson.page.content.map((item, index) => {
              if (item.id && index < 10000) {
                // var sub_task = function (cb) {
                request.post(
                  {
                    headers: { "content-type": "application/json" },
                    url: "https://muasamcong.mpi.gov.vn/o/egp-portal-contractor-selection-v2/services/lcnt_tbmt_ttc_ldt",
                    body: `{"id":"${item.id}"}`,
                    timeout: 50000,
                  },
                  function (error, response, body) {
                    const resp = JSON.parse(body);
                    console.log(
                      "check ne",
                      resp.bidNoContractorResponse.bidNotification.planName
                    );

                    if (
                      resp.bidNoContractorResponse &&
                      resp.bidNoContractorResponse.bidNotification.planName
                    ) {
                      // console.log(
                      //   resp.bidNoContractorResponse.bidNotification.planName
                      // );

                      if (
                        resp.bidNoContractorResponse.bidNotification.planName.includes(
                          "thông tin nguồn"
                        ) ||
                        resp.bidNoContractorResponse.bidNotification.planName.includes(
                          "Mua vật tư"
                        )
                      ) {
                        console.log(resp.bidoNotifyContractorM.planName);
                      }
                    }
                  }
                );
                // };
                // sum += 1;
              }
              // tasks[`check` + `${index}`] = sub_task;
            });
            // console.log(tasks);
          }
        }
      }
    );
  });

  // async.parallel(tasks, function (err, resp) {
  //   if (err) {
  //     //handle error here, the error could be caused by any of the tasks.
  //     console.log(err);
  //     // return;
  //   }
  //   if (resp) {
  //     if (sum) {
  //       console.log("quantity", sum);
  //       console.log("index", resp);
  //       // console.log("resp", resp.check1.bidoNotifyContractorM.planName);
  //       for (let i = 0; i < sum; i++) {
  //         if (
  //           resp[`check` + `${i}`] &&
  //           resp[`check` + `${i}`].bidoNotifyContractorM &&
  //           resp[`check` + `${i}`].bidoNotifyContractorM.planName
  //         ) {
  //           if (
  //             resp[`check` + `${i}`].bidoNotifyContractorM.planName.includes(
  //               "thông tin nguồn"
  //             ) ||
  //             resp[`check` + `${i}`].bidoNotifyContractorM.planName.includes(
  //               "phần mềm"
  //             ) ||
  //             resp[`check` + `${i}`].bidoNotifyContractorM.planName.includes(
  //               "đài truyền thanh"
  //             ) ||
  //             resp[`check` + `${i}`].bidoNotifyContractorM.planName.includes(
  //               "truyền thanh"
  //             ) ||
  //             resp[`check` + `${i}`].bidoNotifyContractorM.planName.includes(
  //               "hệ thống nguồn"
  //             ) ||
  //             resp[`check` + `${i}`].bidoNotifyContractorM.planName.includes(
  //               "chuyển đổi số"
  //             )
  //           ) {
  //             console.log(
  //               resp[`check` + `${i}`].bidoNotifyContractorM.notifyNo
  //             );
  //           }
  //         }
  //       }
  //     }
  //   }
  // });
});

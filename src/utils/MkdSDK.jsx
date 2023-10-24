import { saveAs } from "file-saver";

export default function MkdSDK() {
  // this._baseurl = " https://api.forkfirm.com";
  // this._project_id = "manaknight";
  // this._secret = "5fchxn5m8hbo6jcxiq3xddofodoacskye";

  this.fe_baseurl = "https://app.forkfirm.com";
  this._baseurl = "http://66.94.105.88:3048";
  this._project_id = "forkfirm";
  // this._project_id = "localproject";
  this._secret = "1c6sg0s9gg8c82aneyzw26wu9pp7j5ner";
  // this._secret = "ok5pdxzobdk9so4sgke7ie9zgmyxqmpu";

  this._table = "";
  this._custom = "";
  this._method = "";

  const raw = this._project_id + ":" + this._secret;
  let base64Encode = btoa(raw);

  this.login = async function (email, password, role) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/2fa/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };
  this.loginTwoFa = async function (token, code) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/2fa/auth", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
      },
      body: JSON.stringify({
        code,
        token,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };
  this.regularLogin = async function (email, password, role) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getHeader = function () {
    return {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "x-project": base64Encode,
    };
  };

  this.baseUrl = function () {
    return this._baseurl;
  };
  this.uploadUrl = function () {
    return this._baseurl + "/v2/api/lambda/upload";
  };

  this.upload = async function (payload, method) {
    const header = {
      // "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const result = await fetch(this._baseurl + "/v2/api/lambda/s3/upload", {
      method: method,
      headers: header,
      body: payload,
    });
    const jsonResult = await result.json();

    if (result.status === 401) {
      throw new Error(jsonResult.message);
    }

    if (result.status === 403) {
      throw new Error(jsonResult.message);
    }
    return jsonResult;
  };

  this.uploads = async function (payload, method) {
    const header = {
      // "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    console.log(header);

    const result = await fetch(
      this._baseurl + "/v2/api/lambda/s3/uploads/file",
      {
        method: method,
        headers: header,
        body: payload,
      }
    );
    const jsonResult = await result.json();

    if (result.status === 401) {
      throw new Error(jsonResult.message);
    }

    if (result.status === 403) {
      throw new Error(jsonResult.message);
    }
    return jsonResult;
  };

  this.getProfile = async function () {
    const result = await fetch(this._baseurl + "/v2/api/lambda/profile", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.handleGetUserRole = async (email) => {
    let role = "";
    await fetch(this._baseurl + `/v1/api/rest/user/GETALL`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ customWhere: `email like '${email}'` }),
    })
      .then((res) => res.json())
      .then((res) => (role = res.list[0].role));
    console.log(role);
    return role;
  };

  this.editProfile = async function (payload) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/profile", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        payload,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.check = async function (role) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/check", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        role,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getProfilePreference = async function () {
    const result = await fetch(this._baseurl + "/v2/api/lambda/preference", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.sendMail = async function (payload) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/mail/send", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        to: payload.email,
        from: "info@mkdlabs.com",
        subject: payload.subject,
        body: payload.body,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };
  this.sendMail2Fa = async function (payload) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/mail/send", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        to: payload.email,
        from: "admin@forkfirm.com",
        subject: payload.subject,
        body: payload.body,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // update email
  this.updateEmail = async function (email) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/update/email", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        email,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // update password
  this.updatePassword = async function (currentPassword, password) {
    let token = localStorage.getItem("token");
    console.log(token);
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/update/password",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          password,
          currentPassword,
        }),
      }
    );
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // update email
  this.updateEmailByAdmin = async function (email, id) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/admin/update/email",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          email,
          id,
        }),
      }
    );
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // update password
  this.updatePasswordByAdmin = async function (password, id) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/admin/update/password",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          password,
          id,
        }),
      }
    );
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.sendEmailVerification = function () {};
  this.updateEmailVerification = function () {};

  this.setTable = function (table) {
    this._table = table;
  };

  this.getProjectId = function () {
    return this._project_id;
  };

  this.logout = function () {
    window.localStorage.clear();
  };

  this.register = async function (name, email, password, role) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.registerEmail = async function (
    email,
    password,
    role,
    first_name,
    last_name
  ) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/register-email",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
        },
        body: JSON.stringify({
          email,
          password,
          role,
          first_name,
          last_name,
        }),
      }
    );
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.emailVerify = async function (token) {
    console.log(token);
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/verify-email?token=" + token,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
        },
      }
    );
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.forgot = async function (email, role) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/forgot", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
      },
      body: JSON.stringify({
        email,
        role,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.reset = async function (token, code, password) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/reset", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
      },
      body: JSON.stringify({
        token,
        code,
        password,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };
  this.remove = async function (endPoint) {
    const result = await fetch(this._baseurl + "/v2/api/lambda" + endPoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };
  this.default_card_set = async function (endPoint) {
    const result = await fetch(this._baseurl + "/v2/api/lambda" + endPoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };
  this.addStripeCard = async (data) => {
    console.log(data);
    console.log(data.number);
    console.log(data.cvc);
    console.log(data.expiry.split("/"));

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer pk_live_51N3StPHwSEcLeIF8qGAwhGvmWVydmb1fssGtLWIWJFqbjyqwILq97qKBX0eH2U5I4BnpKMjnBdPYly7j1IANVTcX00wl6ahjyp"
    );
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    // urlencoded.append("card[number]", "4242424242424242");
    // urlencoded.append("card[exp_month]", "11");
    // urlencoded.append("card[exp_year]", "2023");
    // urlencoded.append("card[cvc]", "314");

    urlencoded.append("card[number]", data.number);
    urlencoded.append("card[exp_month]", data.expiry.split("/")[0]);
    urlencoded.append("card[exp_year]", data.expiry.split("/")[1]);
    urlencoded.append("card[cvc]", data.cvc);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    const paginateResult = await fetch(
      "https://api.stripe.com/v1/tokens",
      requestOptions
    );
    const jsonPaginate = await paginateResult.json();

    if (paginateResult.status === 401) {
      throw new Error(jsonPaginate.message);
    }

    if (paginateResult.status === 403) {
      throw new Error(jsonPaginate.message);
    }
    return jsonPaginate;
  };

  this.getAllAttorney = async function (payload, token) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + token,
    };
    const paginateResult = await fetch(
      this._baseurl + `/v2/api/forkfirm/admin/attorney/PAGINATE`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify(payload),
      }
    );
    const jsonPaginate = await paginateResult.json();

    if (paginateResult.status === 401) {
      throw new Error(jsonPaginate.message);
    }

    if (paginateResult.status === 403) {
      throw new Error(jsonPaginate.message);
    }
    return jsonPaginate;
  };
  this.callRestAPI = async function (payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    switch (method) {
      case "GET":
        const getResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/GET`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonGet = await getResult.json();

        if (getResult.status === 401) {
          throw new Error(jsonGet.message);
        }

        if (getResult.status === 403) {
          throw new Error(jsonGet.message);
        }
        return jsonGet;

      case "ADDUSER":
        console.log(payload);
        const postAddUser = await fetch(
          this._baseurl + `/v2/api/forkfirm/admin/register`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonPost = await postAddUser.json();

        if (postAddUser.status === 401) {
          throw new Error(jsonPost.message);
        }

        if (postAddUser.status === 403) {
          throw new Error(jsonPost.message);
        }
        return jsonPost;

      case "REVENUE":
        const revenueData = await fetch(
          this._baseurl + `/v2/api/forkfirm/admin/dashboard/revenue`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonRevenue = await revenueData.json();

        if (revenueData.status === 401) {
          throw new Error(jsonRevenue.message);
        }

        if (revenueData.status === 403) {
          throw new Error(jsonRevenue.message);
        }
        return jsonRevenue;

      // case "GETUSER":
      //   const getUsers = await fetch(
      //     this._baseurl + `/v2/api/forkfirm/admin/get-user`,
      //     {
      //       method: "get",
      //       headers: header,
      //       payload

      //     }
      //   );
      //   const jsonUsers = await getUsers.json();

      //   if (getUsers.status === 401) {
      //     throw new Error(jsonUsers.message);
      //   }

      //   if (getUsers.status === 403) {
      //     throw new Error(jsonUsers.message);
      //   }
      //   return jsonUsers;
      case "CLIENTPOST":
        const updateResult1 = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/POST`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonUpdate1 = await updateResult1.json();

        if (updateResult1.status === 401) {
          throw new Error(jsonUpdate1.message);
        }

        if (updateResult1.status === 403) {
          throw new Error(jsonUpdate1.message);
        }

        return jsonUpdate1;
      case "GETWHERE":
        const getuserRes = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/GETWHERE`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const getuserRes1 = await getuserRes.json();

        if (getuserRes.status === 401) {
          throw new Error(getuserRes1.message);
        }

        if (getuserRes.status === 403) {
          throw new Error(getuserRes1.message);
        }

        return getuserRes1;

      case "EDITATTORNEYPROFILE":
        const insertResult = await fetch(
          this._baseurl + `/v1/api/rest/profile/PUT`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify({
              payload,
            }),
          }
        );

        const jsonInsert = await insertResult.json();

        // console.log(jsonInsert);

        if (insertResult.status === 401) {
          throw new Error(jsonInsert.message);
        }

        if (insertResult.status === 403) {
          throw new Error(jsonInsert.message);
        }

        return jsonInsert;

      case "POST":
        console.log(payload);
        if (
          this._table === "tag" ||
          this._table === "doc_type" ||
          this._table === "law_firm_client" ||
          this._table === "client_rate" ||
          this._table === "client_hours" ||
          this._table === "client_tag" ||
          this._table === "activity_log" ||
          this._table === "contract_tag" ||
          this._table === "client_subclient" ||
          this._table === "project" ||
          this._table === "contract" ||
          this._table === "law_firm_attorney" ||
          this._table === "attorney_client"
        ) {
          const insertResult2 = await fetch(
            this._baseurl + `/v1/api/rest/${this._table}/${method}`,
            {
              method: "post",
              headers: header,
              body: JSON.stringify(payload),
            }
          );
          const jsonInsert2 = await insertResult2.json();
          console.log(jsonInsert2);
          return jsonInsert2;
        } else {
          if (this._table !== "attorney" && this._table !== "client") {
            const insertResult = await fetch(
              this._baseurl + `/v1/api/rest/user/${method}`,
              {
                method: "post",
                headers: header,
                body: JSON.stringify({
                  first_name: payload.first_name,
                  last_name: payload.last_name,
                  email: payload.email,
                  status: payload.status,
                  role: payload.role,
                }),
              }
            );
            const jsonInsert = await insertResult.json();

            console.log(jsonInsert);

            if (insertResult.status === 401) {
              throw new Error(jsonInsert.message);
            }

            if (insertResult.status === 403) {
              throw new Error(jsonInsert.message);
            }

            const insertWebsiteOffice = await fetch(
              this._baseurl + `/v1/api/rest/profile/${method}`,
              {
                method: "post",
                headers: header,
                body: JSON.stringify({
                  base_office: payload.base_office,
                  website: payload.website,
                  user_id: jsonInsert.message,
                }),
              }
            );
            const jsonInsertWebsiteOffice = await insertWebsiteOffice.json();

            console.log(jsonInsertWebsiteOffice);

            return jsonInsert;
          } else {
            const insertResult = await fetch(
              this._baseurl + `/v1/api/rest/user/${method}`,
              {
                method: "post",
                headers: header,
                body: JSON.stringify(payload),
              }
            );
            const jsonInsert = await insertResult.json();

            console.log(jsonInsert);

            if (insertResult.status === 401) {
              throw new Error(jsonInsert.message);
            }

            if (insertResult.status === 403) {
              throw new Error(jsonInsert.message);
            }

            return jsonInsert;
          }
        }

      case "EDITUSER":
        const updateUser = await fetch(
          this._baseurl + `/v2/api/forkfirm/admin/edit-user`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonUpdate3 = await updateUser.json();

        if (updateUser.status === 401) {
          throw new Error(jsonUpdate3.message);
        }

        if (updateUser.status === 403) {
          throw new Error(jsonUpdate3.message);
        }

        return jsonUpdate3;

      case "LAWFIRMATTORNEYS":
        let lawFirmAttorneys = await fetch(
          this._baseurl + `/v2/api/forkfirm/lawfirm/attorney/PAGINATE`,
          {
            method: "POST",
            headers: header,
            body: JSON.stringify(payload),
          }
        );

        const lawFirmAttorneysData = await lawFirmAttorneys.json();

        if (lawFirmAttorneys.status === 401) {
          throw new Error(lawFirmAttorneysData.message);
        }

        if (lawFirmAttorneys.status === 403) {
          throw new Error(lawFirmAttorneysData.message);
        }

        return lawFirmAttorneysData;

      case "LAWFIRMSTATS":
        let lawFirmStats = await fetch(
          this._baseurl + `/v2/api/forkfirm/lawfirm/dashboard/stats`,
          {
            method: "POST",
            headers: header,
            body: JSON.stringify(payload),
          }
        );

        const lawFirmStatsData = await lawFirmStats.json();

        if (lawFirmStats.status === 401) {
          throw new Error(lawFirmStatsData.message);
        }

        if (lawFirmStats.status === 403) {
          throw new Error(lawFirmStatsData.message);
        }

        return lawFirmStatsData;

      case "EDITSELF":
        const updateSelf = await fetch(
          this._baseurl + `/v2/api/forkfirm/admin/edit-self`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const updateSelf3 = await updateSelf.json();

        if (updateSelf.status === 401) {
          throw new Error(updateSelf3.message);
        }

        if (updateSelf.status === 403) {
          throw new Error(updateSelf3.message);
        }

        return updateSelf3;

      case "PUT":
        console.log(payload);
        const updateResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonUpdate = await updateResult.json();

        if (updateResult.status === 401) {
          throw new Error(jsonUpdate.message);
        }

        if (updateResult.status === 403) {
          throw new Error(jsonUpdate.message);
        }

        return { ...jsonUpdate, user_id: jsonUpdate.message };

      case "PUTATTORNEY":
        console.log(payload);
        const updateResult3 = await fetch(
          this._baseurl + `/v2/api/forkfirm/admin/attorney/PUT`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );

        console.log(updateResult3);
        const jsonUpdate0 = await updateResult3.json();

        if (updateResult3.status === 401) {
          throw new Error(jsonUpdate0.message);
        }

        if (updateResult3.status === 403) {
          throw new Error(jsonUpdate0.message);
        }

        return { ...jsonUpdate0 };

      case "CLIENTRATEPUT":
        const updateResult2 = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/PUT`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify({
              id: parseInt(payload.id),
              rate: payload.rate,
            }),
          }
        );
        console.log(updateResult2);
        const jsonUpdate2 = await updateResult2.json();

        if (updateResult2.status === 401) {
          throw new Error(jsonUpdate2.message);
        }

        if (updateResult2.status === 403) {
          throw new Error(jsonUpdate2.message);
        }

        return { ...jsonUpdate2, user_id: jsonUpdate2.message };

      // Part: Update Table Without Using ID
      case "PUTWHERE":
        const updateWhereRes = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload), // Note: payload: {set: {[string]: any}, where: {[string]: any}}
          }
        );
        const jsonUpdateWhereRes = await updateWhereRes.json();

        if (updateWhereRes.status === 401) {
          throw new Error(jsonUpdateWhereRes.message);
        }

        return jsonUpdateWhereRes;

      case "DELETE":
        console.log(payload);
        const deleteResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonDelete = await deleteResult.json();

        if (deleteResult.status === 401) {
          throw new Error(jsonDelete.message);
        }

        if (deleteResult.status === 403) {
          throw new Error(jsonDelete.message);
        }
        return jsonDelete;
      case "DELETEALL":
        const deleteAllResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonDeleteAll = await deleteAllResult.json();

        if (deleteAllResult.status === 401) {
          throw new Error(jsonDeleteAll.message);
        }

        if (deleteAllResult.status === 403) {
          throw new Error(jsonDeleteAll.message);
        }
        return jsonDeleteAll;
      case "GETALL":
        let body;
        if (payload) {
          body = {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          };
        } else {
          body = {
            method: "post",
            headers: header,
          };
        }
        const getAllResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          body
        );
        const jsonGetAll = await getAllResult.json();
        if (getAllResult.status === 401) {
          throw new Error(jsonGetAll.message);
        }

        if (getAllResult.status === 403) {
          throw new Error(jsonGetAll.message);
        }
        return jsonGetAll;

      case "VIEWCLIENTLAWFIRMS":
        let res = await fetch(
          this._baseurl + `/v2/api/forkfirm/admin/client/view-law-firms`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );

        const jsonBody = await res.json();

        if (res.status === 401) {
          throw new Error(jsonBody.message);
        }

        if (res.status === 403) {
          throw new Error(jsonBody.message);
        }
        return jsonBody;

      case "LAWFIRMDATAPAGINATE":
        const lawFirmData = await fetch(
          this._baseurl + "/v2/api/forkfirm/lawfirm/dashboard/document",
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );

        const lawFirmDataPaginate = await lawFirmData.json();

        if (lawFirmData.status === 401) {
          throw new Error(lawFirmDataPaginate.message);
        }

        if (lawFirmData.status === 403) {
          throw new Error(lawFirmDataPaginate.message);
        }
        return lawFirmDataPaginate;

      case "PAGINATE":
        if (!payload.page) {
          payload.page = 1;
        }
        if (!payload.limit) {
          payload.limit = 10;
        }
        let paginateResult = "";
        if (
          this._table === "tag" ||
          this._table === "doc_type" ||
          this._table === "user" ||
          this._table === "activity_log" ||
          this._table === "email"
        ) {
          paginateResult = await fetch(
            this._baseurl + `/v1/api/rest/${this._table}/${method}`,
            {
              method: "post",
              headers: header,
              body: JSON.stringify(payload),
            }
          );
        } else if (
          this._table === "attorney/client" ||
          this._table === "attorney/project"
        ) {
          paginateResult = await fetch(
            this._baseurl + `/v2/api/forkfirm/${this._table}/${method}`,
            {
              method: "POST",
              headers: header,
              body: JSON.stringify(payload),
            }
          );
        } else if (this._table === "activity") {
          paginateResult = await fetch(
            this._baseurl + `/v2/api/forkfirm/lawfirm/${this._table}/${method}`,
            {
              method: "POST",
              headers: header,
              body: JSON.stringify(payload),
            }
          );
        } else {
          paginateResult = await fetch(
            this._baseurl + `/v2/api/forkfirm/admin/${this._table}/${method}`,
            {
              method: "post",
              headers: header,
              body: JSON.stringify(payload),
            }
          );
        }
        const jsonPaginate = await paginateResult.json();

        if (paginateResult.status === 401) {
          throw new Error(jsonPaginate.message);
        }

        if (paginateResult.status === 403) {
          throw new Error(jsonPaginate.message);
        }
        return jsonPaginate;

      case "EXPORT":
        if (!payload.page) {
          payload.page = 1;
        }
        if (!payload.limit) {
          payload.limit = 10;
        }
        const exportResult = await fetch(
          this._baseurl + `/v2/api/forkfirm/client/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );

        console.log(exportResult);
        // Extract filename from header
        const filename = "export.csv";
        const blob = await exportResult.blob();

        // Download the file
        saveAs(blob, filename);

        if (exportResult.status === 401) {
          throw new Error("");
        }

        if (exportResult.status === 403) {
          throw new Error("");
        }
        return "Success!";

      case "AUTOCOMPLETE":
        const autocompleteResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonAutocomplete = await autocompleteResult.json();

        if (autocompleteResult.status === 401) {
          throw new Error(jsonAutocomplete.message);
        }

        if (autocompleteResult.status === 403) {
          throw new Error(jsonAutocomplete.message);
        }
        return jsonAutocomplete;
      default:
        break;
    }
  };

  // this.getAllProjectForAttorney = async function () {
  //   var myHeaders = new Headers();
  //   myHeaders.append(
  //     "x-project",
  //     "Zm9ya2Zpcm06MWM2c2cwczlnZzhjODJhbmV5encyNnd1OXBwN2o1bmVy"
  //   );
  //   myHeaders.append(
  //     "Authorization",
  //     "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5LCJyb2xlIjoiY2xpZW50IiwiaWF0IjoxNjcwMDAyODAyLCJleHAiOjE2NzAwMDY0MDJ9.sClo7VdAro2vGCFltqoxTTzwvzm-VJVuMzcIOL-Gy7Q"
  //   );
  //   myHeaders.append("Content-Type", "application/json");
  //   console.log(base64Encode);
  //   var raw = JSON.stringify({
  //     where: {
  //       "forkfirm_attorney_client.attorney_id": 5,
  //     },
  //     page: 1,
  //     limit: 10,
  //   });

  //   var requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //     redirect: "follow",
  //   };

  //   const insertResult = await fetch(
  //     this._baseurl + "/v2/api/forkfirm/attorney/project/PAGINATE",
  //     requestOptions
  //   );
  //   const jsonInsert = await insertResult.json();

  //   console.log(jsonInsert);

  //   if (insertResult.status === 401) {
  //     throw new Error(jsonInsert.message);
  //   }

  //   if (insertResult.status === 403) {
  //     throw new Error(jsonInsert.message);
  //   }
  //   return jsonInsert;
  // };
  this.getLawfirmRates = async function (payload) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const insertResult = await fetch(
      this._baseurl + `/v2/api/forkfirm/admin/lawfirm/view-rates`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify(payload),
      }
    );
    const jsonInsert = await insertResult.json();

    if (insertResult.status === 401) {
      throw new Error(jsonInsert.message);
    }

    if (insertResult.status === 403) {
      throw new Error(jsonInsert.message);
    }
    return jsonInsert;
  };
  this.getClientRates = async function (payload) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const insertResult = await fetch(
      this._baseurl + `/v2/api/forkfirm/admin/client/view-rates`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify(payload),
      }
    );
    const jsonInsert = await insertResult.json();

    if (insertResult.status === 401) {
      throw new Error(jsonInsert.message);
    }

    if (insertResult.status === 403) {
      throw new Error(jsonInsert.message);
    }
    return jsonInsert;
  };
  this.getSubClients = async function (payload) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const insertResult = await fetch(
      this._baseurl + `/v2/api/forkfirm/admin/client/subclient`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify({ ...payload, groupBy: "subclient.id" }),
      }
    );
    const jsonInsert = await insertResult.json();

    console.log(jsonInsert);

    if (insertResult.status === 401) {
      throw new Error(jsonInsert.message);
    }

    if (insertResult.status === 403) {
      throw new Error(jsonInsert.message);
    }
    return jsonInsert;
  };

  this.exportCSVFile = async function (payload) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const exportResult = await fetch(
      this._baseurl + `/rest/${this._table}/EXPORT`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify(payload),
      }
    );

    console.log(exportResult);
    // Extract filename from header
    const filename = "export.csv";
    const blob = await exportResult.blob();

    // Download the file
    saveAs(blob, filename);

    if (exportResult.status === 401) {
      throw new Error("");
    }

    if (exportResult.status === 403) {
      throw new Error("");
    }
    return "Success!";
  };

  this.exportRawCSVFile = async function (url, payload) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const exportResult = await fetch(this._baseurl + url, {
      method: "post",
      headers: header,
      body: JSON.stringify(payload),
    });

    // Extract filename from header
    const filename = "export.csv";
    const blob = await exportResult.blob();

    // Download the file
    saveAs(blob, filename);

    if (exportResult.status === 401) {
      throw new Error("");
    }

    if (exportResult.status === 403) {
      throw new Error("");
    }
    return "Success!";
  };

  this.callRawAPI = async function (uri, payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const result = await fetch(this._baseurl + uri, {
      method: method,
      headers: header,
      body: JSON.stringify(payload),
    });
    const jsonResult = await result.json();

    // console.log(jsonResult);

    if (result.status === 401) {
      throw new Error(jsonResult.message);
    }

    if (result.status === 403) {
      throw new Error(jsonResult.message);
    }
    return jsonResult;
  };

  // Part: Get All Data by Joining Two Columns
  this.callJoinRestAPI = async function (
    table_1,
    table_2,
    join_id_1,
    join_id_2,
    select = "",
    where = [1],
    method = "GETALL",
    page = 1,
    limit = 10000
  ) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const payload = {
      tables: [table_1, table_2],
      join_id_1,
      join_id_2,
      select,
      where,
      page,
      limit,
    };
    console.log(where);
    const paginateResult = await fetch(
      this._baseurl + `/v1/api/join/${table_1}/${table_2}/${method}`,
      { method: "post", headers: header, body: JSON.stringify(payload) }
    );

    const jsonPaginate = await paginateResult.json();

    if (paginateResult.status === 401) {
      throw new Error(jsonPaginate.message);
    }

    if (paginateResult.status === 403) {
      throw new Error(jsonPaginate.message);
    }
    return jsonPaginate;
  };

  // Part: Get Data by Joining Multiple Columns with Pagination
  this.callMultiJoinRestAPI = async function (
    tables,
    joinIds,
    selectStr,
    where,
    page,
    limit,
    method
  ) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }
    const paginateResult = await fetch(
      this._baseurl + `/v1/api/multi-join/${method}`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify({
          tables, // ["tableName1", "tableName2"]
          joinIds, // ["tableName1.id", "tableName2.id"]
          selectStr, // "tableName1.field1, tableName2.field2"
          where, // ["status=2424", "id=1"]
          page,
          limit,
        }),
      }
    );
    const jsonPaginate = await paginateResult.json();

    if (paginateResult.status === 401) {
      throw new Error(jsonPaginate.message);
    }

    if (paginateResult.status === 403) {
      throw new Error(jsonPaginate.message);
    }
    return jsonPaginate;
  };

  this.subscribe = function (payload) {};
  this.subscribeChannel = function (channel, payload) {};
  this.subscribeListen = function (channel) {};
  this.unSubscribeChannel = function (channel, payload) {};
  this.broadcast = function (payload) {};

  this.exportCSV = function (payload) {};

  this.cmsAdd = async function (page, key, type, value) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const insertResult = await fetch(this._baseurl + `/v2/api/lambda/cms`, {
      method: "post",
      headers: header,
      body: JSON.stringify({
        page,
        key,
        type,
        value,
      }),
    });
    const jsonInsert = await insertResult.json();

    if (insertResult.status === 401) {
      throw new Error(jsonInsert.message);
    }

    if (insertResult.status === 403) {
      throw new Error(jsonInsert.message);
    }
    return jsonInsert;
  };

  this.cmsEdit = async function (id, page, key, type, value) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const updateResult = await fetch(
      this._baseurl + `/v2/api/lambda/cms/` + id,
      {
        method: "put",
        headers: header,
        body: JSON.stringify({
          page,
          key,
          type,
          value,
        }),
      }
    );
    const jsonInsert = await updateResult.json();

    if (updateResult.status === 401) {
      throw new Error(jsonInsert.message);
    }

    if (updateResult.status === 403) {
      throw new Error(jsonInsert.message);
    }
    return jsonInsert;
  };

  this.getToken = function () {
    return window.localStorage.getItem("token");
  };

  // get chat room
  this.getMyRoom = async function () {
    const result = await fetch(
      this._baseurl + "/v3/api/lambda/realtime/room/my",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // get chat id
  this.getChatId = async function (room_id) {
    const result = await fetch(
      this._baseurl + `/v2/api/lambda/room?room_id=${room_id}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // post chat
  this.getChats = async function (room_id, chat_id, date) {
    const result = await fetch(this._baseurl + `/v3/api/lambda/realtime/chat`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        room_id,
        chat_id,
        date,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.restoreChat = async function (room_id) {
    await fetch(
      this._baseurl + `/v2/api/lambda/v2/api/lambda/room/poll?room=${room_id}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  };

  // post a new message
  this.postMessage = async function (messageDetails) {
    const result = await fetch(this._baseurl + `/v3/api/lambda/realtime/send`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(messageDetails),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.uploadImage = async function (file) {
    const result = await fetch(this._baseurl + `/v2/api/lambda/s3/upload`, {
      method: "post",
      headers: {
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: file,
    });

    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.createRoom = async function (roomDetails) {
    const result = await fetch(this._baseurl + `/v3/api/lambda/realtime/room`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(roomDetails),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getAllUsers = async function () {
    const result = await fetch(this._baseurl + `/v1/api/rest/user/GETALL`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  // start pooling
  this.startPooling = async function (user_id) {
    const result = await fetch(
      this._baseurl + `/v3/api/lambda/realtime/room/poll?user_id=${user_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  /**
   * start stripe functions
   */

  this.addStripeProduct = async function (data) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/stripe/product",
      {
        method: "post",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getStripeProducts = async function (paginationParams, filterParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/products?${paginationQuery}&${filterQuery}`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getStripeProduct = async function (id) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/product/${id}`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.updateStripeProduct = async function (id, payload) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/product/${id}`,
      {
        method: "put",
        headers: header,
        body: JSON.stringify(payload),
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.addStripePrice = async function (data) {
    const result = await fetch(this._baseurl + "/v2/api/lambda/stripe/price", {
      method: "post",
      headers: {
        "content-Type": "application/json",
        "x-project": base64Encode,
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getStripePrices = async function (paginationParams, filterParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/prices?${paginationQuery}&${filterQuery}`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getStripePrice = async function (id) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/price/${id}`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.updateStripePrice = async function (id, payload) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/price/${id}`,
      {
        method: "put",
        headers: header,
        body: JSON.stringify(payload),
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getStripeSubscriptions = async function (
    paginationParams,
    filterParams
  ) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/subscriptions?${paginationQuery}&${filterQuery}`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.adminCancelStripeSubscription = async function (subId, data) {
    const result = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/subscription/${subId}`,
      {
        method: "delete",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }

    return json;
  };

  this.adminCreateUsageCharge = async function (subId, quantity) {
    const result = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/subscription/usage-charge`,
      {
        method: "post",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          subId,
          quantity,
        }),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }

    return json;
  };

  this.getStripeInvoices = async function (paginationParams, filterParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/invoices?${paginationQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };
  this.getStripeInvoicesV2 = async function (paginationParams, filterParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/invoices-v2?${paginationQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getStripeOrders = async function (paginationParams, filterParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/orders?${paginationQuery}&${filterQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  /**
   * -------------------------------------------------------
   */

  this.initCheckoutSession = async function (data) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/stripe/checkout",
      {
        method: "post",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.registerAndSubscribe = async function (data) {
    /**
     *
     * @param {object} data {email, password, cardToken, planId}
     * @returns
     */
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/stripe/customer/register-subscribe",
      {
        method: "post",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.createStripeCustomer = async function (payload) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify(payload),
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.createCustomerStripeCard = async function (payload) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer/card`,
      {
        method: "post",
        headers: header,
        body: JSON.stringify(payload),
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.createStripeSubscription = async function (data) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/stripe/customer/subscription",
      {
        method: "post",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getCustomerStripeSubscription = async function (userId) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer/subscription`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getCustomerStripeSubscriptions = async function (
    paginationParams,
    filterParams
  ) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const filterQuery = new URLSearchParams(filterParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/customer/subscriptions?${paginationQuery}&${filterQuery}`,
      {
        method: "get",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.changeStripeSubscription = async function (data) {
    const result = await fetch(
      this._baseurl + "/v2/api/lambda/stripe/customer/subscription",
      {
        method: "put",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.cancelStripeSubscription = async function (subId, data) {
    const result = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer/subscription/${subId}`,
      {
        method: "delete",
        headers: {
          "content-Type": "application/json",
          "x-project": base64Encode,
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
      }
    );

    const json = await result.json();
    if ([401, 403, 500].includes(result.status)) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getCustomerStripeDetails = async function () {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getCustomerStripeCards = async function (paginationParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer/cards?${paginationQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getCustomerStripeInvoices = async function (paginationParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/customer/invoices?${paginationQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getCustomerStripeCharges = async function (paginationParams) {
    const header = {
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/customer/charges?${paginationQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getCustomerStripeOrders = async function (paginationParams) {
    const header = {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "x-project": base64Encode,
    };
    const paginationQuery = new URLSearchParams(paginationParams);
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/customer/orders?${paginationQuery}`,
      {
        method: "get",
        headers: header,
      }
    );

    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.setStripeCustomerDefaultCard = async function (cardId) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const getResult = await fetch(
      this._baseurl +
        `/v2/api/lambda/stripe/customer/card/${cardId}/set-default`,
      {
        method: "put",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.deleteCustomerStripeCard = async function (cardId) {
    const header = {
      "content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    const getResult = await fetch(
      this._baseurl + `/v2/api/lambda/stripe/customer/card/${cardId}`,
      {
        method: "delete",
        headers: header,
      }
    );
    const jsonGet = await getResult.json();

    if ([401, 403, 500].includes(getResult.status)) {
      throw new Error(jsonGet.message);
    }

    return jsonGet;
  };

  this.getSavePaymentMethod = async function (uri, payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    const result = await fetch(this._baseurl + uri, {
      method: method,
      headers: header,
      // body: JSON.stringify(payload),
    });
    const jsonResult = await result.json();

    if (result.status === 401) {
      throw new Error(jsonResult.message);
    }

    if (result.status === 403) {
      throw new Error(jsonResult.message);
    }
    return jsonResult;
  };

  /** end stripe functions */
  return this;
}

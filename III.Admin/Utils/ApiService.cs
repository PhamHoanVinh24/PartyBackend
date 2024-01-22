using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Net.Http;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Http;
using System.Collections.Specialized;
using System.Text.Encodings.Web;
using ESEIM.Utils;
using System.Reflection;
using III.Admin.Controllers;

namespace ESEIM.Utils
{
    public static class API
    {
        public static async Task<JMessage> SendAPIRequest(Object obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var appSetting = CommonUtil.GetConfiguration().GetSection("AppSettings");

                var urlApi = appSetting.GetSection("UrlApi").Value;

                var data = JsonConvert.SerializeObject(obj,
                            Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                NullValueHandling = NullValueHandling.Ignore
                            });

                var httpWebRequest = (HttpWebRequest)WebRequest.Create(urlApi);
                httpWebRequest.ContentType = "application/json";
                httpWebRequest.Method = "POST";

                using (var streamWriter = new StreamWriter(await httpWebRequest.GetRequestStreamAsync()))
                {
                    streamWriter.Write(data);
                }

                var httpResponse = (HttpWebResponse)await httpWebRequest.GetResponseAsync();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    var result = streamReader.ReadToEnd();

                    if (!string.IsNullOrEmpty(result))
                    {
                        msg = JsonConvert.DeserializeObject<JMessage>(result);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không lấy được dữ liệu";
                    }
                }
            }
            catch (WebException wex)
            {
                msg.Error = true;
                if (wex.Response != null)
                {
                    var statusCode = (int)((HttpWebResponse)wex.Response).StatusCode;

                    using (var errorResponse = (HttpWebResponse)wex.Response)
                    {
                        using (var reader = new StreamReader(errorResponse.GetResponseStream()))
                        {
                            try
                            {
                                var error = reader.ReadToEnd();
                                msg.Error = true;
                                msg.Title = error;
                            }
                            catch (Exception ex)
                            {
                                msg.Title = ex.Message;
                            }
                        }
                    }
                }
            }

            return msg;
        }

        public static async Task<JMessage> Refresh()
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var req = new ApiRequest
                {
                    ActionName = "Refresh",
                };

                msg = await SendAPIRequest(req);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return msg;
        }

        public class ApiRequest
        {
            public string ActionName { get; set; }
        }
    }
}

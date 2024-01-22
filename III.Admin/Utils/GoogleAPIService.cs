using ESEIM;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Google.Apis.Auth;
using Microsoft.IdentityModel.Tokens;

namespace ESEIM.Utils
{
    //Modal address
    public class Point
    {
        public float? X { get; set; }
        public float? Y { get; set; }
    }
    public class GoogleGeoCodeResponse
    {

        public string status { get; set; }
        public results[] results { get; set; }

    }
    public class results
    {
        public string formatted_address { get; set; }
        public geometry geometry { get; set; }
        public string[] types { get; set; }
        public address_component[] address_components { get; set; }
    }
    public class geometry
    {
        public string location_type { get; set; }
        public location location { get; set; }
    }
    public class location
    {
        public string lat { get; set; }
        public string lng { get; set; }
    }
    public class address_component
    {
        public string long_name { get; set; }
        public string short_name { get; set; }
        public string[] types { get; set; }
    }


    //Model polygon gps
    public class GisObject
    {
        public GisObject()
        {
            type = "";
            properties = new GisPropertise();
            geometry = new Geometry();
        }
        public string type { get; set; }
        public GisPropertise properties { get; set; }
        public Geometry geometry { get; set; }
    }
    public class GisPropertise
    {

        public int ID_0 { get; set; }
        public string ISO { get; set; }
        public string NAME_0 { get; set; }
        public int ID_1 { get; set; }
        public string NAME_1 { get; set; }
        public int ID_2 { get; set; }
        public string NAME_2 { get; set; }
        public string HASC_2 { get; set; }
        public int CCN_2 { get; set; }
        public string TYPE_2 { get; set; }
        public string ENGTYPE_2 { get; set; }
        public string VARNAME_2 { get; set; }
    }
    public class Geometry
    {
        public Geometry()
        {
            type = "";
            coordinates = new List<List<List<double>>>();
            coordinates.Add(new List<List<double>>());
        }
        public string type { get; set; }
        public List<List<List<double>>> coordinates { get; set; }
    }
    public class Map
    {
        public MapProperties properties { get; set; }
        public List<List<List<double>>> gis_data { get; set; }
    }
    public class MapProperties
    {
        public string fill_color { get; set; }
        public string text { get; set; }
        public string font_size { get; set; }

    }

    public class AddressOpenstreetmap
    {
        public string place_id { get; set; }
        public string licence { get; set; }
        public string osm_type { get; set; }
        public string osm_id { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string display_name { get; set; }
        public AddressObjOpenstreetMap address { get; set; }
    }
    public class AddressObjOpenstreetMap
    {
        public string city { get; set; }
        public string country { get; set; }
        public string country_code { get; set; }
        public string county { get; set; }
        public string postcode { get; set; }
        public string road { get; set; }
        public string suburb { get; set; }
    }
    public class ExternalAuthDto
    {
        public string Provider { get; set; }
        public string IdToken { get; set; }
        public string DeviceToken { get; set; }
        public string Device { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Subject { get; set; }
    }
    public class FacebookUser
    {
        public Guid Id { get; set; }
        public string SocialUserId { get; set; }
        public string Email { get; set; }
        public bool IsVerified { get; set; }
        public string Name { get; set; }

        public FacebookUser()
        {
            IsVerified = false;
        }
    }
    public interface IGoogleApiService
    {
        Task<GoogleGeoCodeResponse> GetAddress(string latitude, string longitude);
        double[] Wgs84ToGoogleBing(double lon, double lat);
        double[] GoogleBingtoWgs84Mercator(double x, double y);

        bool IsInPolygon(string point, string polygon);
        string ConvertLatLnToMap(string googleMap);
        Task<string> GetAddressForCoordinates(double latitude, double longitude);
        Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAndroid(ExternalAuthDto externalAuth);
        Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenIos(ExternalAuthDto externalAuth);
        Task<FacebookUser> VerifyFacebookTokenDev(ExternalAuthDto externalAuth);
        Task<FacebookUser> VerifyFacebookTokenProd(ExternalAuthDto externalAuth);
        Task<string> VerifyAppleIdTokenDev(ExternalAuthDto externalAuth);
        Task<string> VerifyAppleIdTokenProd(ExternalAuthDto externalAuth);
    }

    public class GoogleApiService : IGoogleApiService
    {
        private readonly AppSettings _appSettings;
        public GoogleApiService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }
        public async Task<GoogleGeoCodeResponse> GetAddress(string latitude, string longitude)
        {
            GoogleGeoCodeResponse result = new GoogleGeoCodeResponse();
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(_appSettings.UrlBase);
                    var content = new FormUrlEncodedContent(new[]
                    {
                        new KeyValuePair<string, string>("latitude", latitude),
                        new KeyValuePair<string, string>("longitude", longitude)
                    });
                    var result1 = await client.PostAsync("MobileLogin/GetAddress", content);
                    string resultContent = await result1.Content.ReadAsStringAsync();
                    result = JsonConvert.DeserializeObject<GoogleGeoCodeResponse>(resultContent);
                }
            }
            catch (Exception ex)
            {
                var k = 0;
            }
            return result;
        }

        //Conversion: EPSG:4326 TO EPSG:3857
        public double[] Wgs84ToGoogleBing(double lon, double lat)
        {
            double x = lon * 20037508.34 / 180;
            double y = Math.Log(Math.Tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            y = y * 20037508.34 / 180;
            return new double[] { x, y };
        }

        //Conversion: EPSG:3857 TO EPSG:4326
        public double[] GoogleBingtoWgs84Mercator(double x, double y)
        {
            double lon = (x / 20037508.34) * 180;
            double lat = (y / 20037508.34) * 180;

            lat = 180 / Math.PI * (2 * Math.Atan(Math.Exp(lat * Math.PI / 180)) - Math.PI / 2);
            return new double[] { lon, lat };
        }

        public bool IsInPolygon(string point, string polygon)
        {
            try
            {
                //point = "[105.8096319437027,20.990909563014448]";
                //polygon = "[[[105.80894261598587,20.991352807581404],[105.8089479804039,20.991262656250637],[105.80914109945296,20.991320252940465],[105.80894261598587,20.991352807581404]]]";

                var point1 = JsonConvert.DeserializeObject<List<string>>(point);
                var _polygon = new List<Point>();

                var polygons = JsonConvert.DeserializeObject<List<List<List<string>>>>(polygon);
                if (polygons.Count > 0)
                {
                    foreach (var item in polygons.FirstOrDefault())
                    {
                        var p = new Point
                        {
                            X = float.Parse(item[0]),
                            Y = float.Parse(item[1])
                        };

                        _polygon.Add(p);
                    }
                }

                var _point = new Point
                {
                    X = float.Parse(point1[0]),
                    Y = float.Parse(point1[1])
                };

                var coef = _polygon.Skip(1).Select((p, i) =>
                                                (_point.Y - _polygon[i].Y) * (p.X - _polygon[i].X)
                                              - (_point.X - _polygon[i].X) * (p.Y - _polygon[i].Y))
                                        .ToList();

                if (coef.Any(p => p == 0))
                    return true;

                for (int i = 1; i < coef.Count(); i++)
                {
                    if (coef[i] * coef[i - 1] < 0)
                        return false;
                }
                return true;
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public string ConvertLatLnToMap(string googleMap)
        {
            var gps = googleMap.Split(",");
            Map map = new Map();
            GisObject gisObject = new GisObject();
            for (var item = 0; item < 3; ++item)
            {
                List<double> m = new List<double>();
                m.Add((Double.Parse(gps[1].Trim())) * 20037508.34 / 180);
                m.Add((Math.Log(Math.Tan((90 + (Double.Parse(gps[0].Trim()))) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                gisObject.geometry.coordinates[0].Add(m);
            }

            map.gis_data = gisObject.geometry.coordinates;
            map.properties = new MapProperties
            {
                fill_color = "#64c936",
                font_size = "12"
            };
            return JsonConvert.SerializeObject(map);
        }

        public async Task<string> GetAddressForCoordinates(double latitude, double longitude)
        {
            AddressOpenstreetmap result = new AddressOpenstreetmap();
            var address = "";
            try
            {
                
                HttpClient httpClient = new HttpClient { BaseAddress = new Uri("https://nominatim.openstreetmap.org/") };
                httpClient.DefaultRequestHeaders.Add("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)");
                httpClient.DefaultRequestHeaders.Add("Referer", "http://www.microsoft.com");
                HttpResponseMessage httpResult = await httpClient.GetAsync(
                    String.Format("reverse?format=json&lat={0}&lon={1}", latitude, longitude));
                result = JsonConvert.DeserializeObject<AddressOpenstreetmap>(await httpResult.Content.ReadAsStringAsync());
                address = result.address.suburb + ", " + result.address.county + ", " + result.address.city + ", " + result.address.country;
            }
            catch (Exception ex)
            {
                
            }
            return address;
        }

        public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAndroid(ExternalAuthDto externalAuth)
        {
            try
            {
                var clientId = "322906159773-c05ummubib9u1harvk47vc2f880vkpue.apps.googleusercontent.com";
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { clientId }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(externalAuth.IdToken, settings);
                return payload;
            }
            catch (Exception ex)
            {
                //log an exception
                return null;
            }
        }
        public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenIos(ExternalAuthDto externalAuth)
        {
            try
            {
                var clientId = "322906159773-mh4egbamq5u3jg0nm1cdr78fqfic3vpi.apps.googleusercontent.com";
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { clientId }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(externalAuth.IdToken, settings);
                return payload;
            }
            catch (Exception ex)
            {
                //log an exception
                return null;
            }
        }
        public async Task<FacebookUser> VerifyFacebookTokenDev(ExternalAuthDto externalAuth)
        {
            var user = new FacebookUser();
            var client = new HttpClient();
            var token = externalAuth.IdToken;
            var appId = "2957941441176549";

            var verifyTokenEndPoint = $"https://graph.facebook.com/me?access_token={token}&fields=email,name";
            var verifyAppEndpoint = $"https://graph.facebook.com/app?access_token={token}";

            var uri = new Uri(verifyTokenEndPoint);
            var response = await client.GetAsync(uri);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                dynamic userObj = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(content);

                uri = new Uri(verifyAppEndpoint);
                response = await client.GetAsync(uri);
                content = await response.Content.ReadAsStringAsync();
                dynamic appObj = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(content);

                if (appObj != null && appObj["id"] == appId)
                {
                    //token is from our App
                    if (userObj != null)
                    {
                        user.SocialUserId = userObj["id"];
                        user.Email = userObj["email"];
                        user.Name = userObj["name"];
                    }

                    user.IsVerified = true;
                }

                return user;
            }
            return user;
        }
        public async Task<FacebookUser> VerifyFacebookTokenProd(ExternalAuthDto externalAuth)
        {
            var user = new FacebookUser();
            var client = new HttpClient();
            var token = externalAuth.IdToken;
            var appId = "862894854914151";

            var verifyTokenEndPoint = $"https://graph.facebook.com/me?access_token={token}&fields=email,name";
            var verifyAppEndpoint = $"https://graph.facebook.com/app?access_token={token}";

            var uri = new Uri(verifyTokenEndPoint);
            var response = await client.GetAsync(uri);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                dynamic userObj = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(content);

                uri = new Uri(verifyAppEndpoint);
                response = await client.GetAsync(uri);
                content = await response.Content.ReadAsStringAsync();
                dynamic appObj = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(content);

                if (appObj != null && appObj["id"] == appId)
                {
                    //token is from our App
                    if (userObj != null)
                    {
                        user.SocialUserId = userObj["id"];
                        user.Email = userObj["email"];
                        user.Name = userObj["name"];
                    }

                    user.IsVerified = true;
                }

                return user;
            }
            return user;
        }
        public async Task<string> VerifyAppleIdTokenDev(ExternalAuthDto externalAuth)
        {
            string clientId = "com.firebase.MetaLearn";
            string token = externalAuth.IdToken;
            //Read the token and get it's claims using System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecurityToken = tokenHandler.ReadJwtToken(token);
            var claims = jwtSecurityToken.Claims;
            SecurityKey publicKey; SecurityToken validatedToken;

            //Get the expiration of the token and convert its value from unix time seconds to DateTime object
            var expirationClaim = claims.FirstOrDefault(x => x.Type == "exp")?.Value;
            var expirationTime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(expirationClaim ?? "1000")).DateTime;

            if (expirationTime < DateTime.UtcNow)
            {
                throw new SecurityTokenExpiredException("Expired token");
            }

            using (var httpClient = new HttpClient())
            {
                //Request Apple's JWKS used for verifying the tokens.
                var applePublicKeys = httpClient.GetAsync("https://appleid.apple.com/auth/keys");
                var content = applePublicKeys.Result.Content;
                var stringRs = content.ReadAsStringAsync().Result;
                var keySet = new JsonWebKeySet(stringRs);

                //Since there is more than one JSON Web Key we select the one that has been used for our token.
                //This is achieved by filtering on the "Kid" value from the header of the token
                publicKey = keySet.Keys.FirstOrDefault(x => x.Kid == jwtSecurityToken.Header.Kid);
            }

            //Create new TokenValidationParameters object which we pass to ValidateToken method of JwtSecurityTokenHandler.
            //The handler uses this object to validate the token and will throw an exception if any of the specified parameters is invalid.
            var validationParameters = new TokenValidationParameters
            {
                ValidIssuer = "https://appleid.apple.com",
                IssuerSigningKey = publicKey,
                ValidAudience = clientId
            };

            tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
            return claims.FirstOrDefault(x => x.Type == "email")?.Value;
        }
        public async Task<string> VerifyAppleIdTokenProd(ExternalAuthDto externalAuth)
        {
            string clientId = "com.iii.MetaLearn";
            string token = externalAuth.IdToken;
            //Read the token and get it's claims using System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecurityToken = tokenHandler.ReadJwtToken(token);
            var claims = jwtSecurityToken.Claims;
            SecurityKey publicKey; SecurityToken validatedToken;

            //Get the expiration of the token and convert its value from unix time seconds to DateTime object
            var expirationClaim = claims.FirstOrDefault(x => x.Type == "exp")?.Value;
            var expirationTime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(expirationClaim ?? "1000")).DateTime;

            if (expirationTime < DateTime.UtcNow)
            {
                throw new SecurityTokenExpiredException("Expired token");
            }

            using (var httpClient = new HttpClient())
            {
                //Request Apple's JWKS used for verifying the tokens.
                var applePublicKeys = httpClient.GetAsync("https://appleid.apple.com/auth/keys");
                var content = applePublicKeys.Result.Content;
                var stringRs = content.ReadAsStringAsync().Result;
                var keySet = new JsonWebKeySet(stringRs);

                //Since there is more than one JSON Web Key we select the one that has been used for our token.
                //This is achieved by filtering on the "Kid" value from the header of the token
                publicKey = keySet.Keys.FirstOrDefault(x => x.Kid == jwtSecurityToken.Header.Kid);
            }

            //Create new TokenValidationParameters object which we pass to ValidateToken method of JwtSecurityTokenHandler.
            //The handler uses this object to validate the token and will throw an exception if any of the specified parameters is invalid.
            var validationParameters = new TokenValidationParameters
            {
                ValidIssuer = "https://appleid.apple.com",
                IssuerSigningKey = publicKey,
                ValidAudience = clientId
            };

            tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
            return claims.FirstOrDefault(x => x.Type == "email")?.Value;
        }
    }
}

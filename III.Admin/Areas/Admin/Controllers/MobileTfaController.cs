using ESEIM.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileTfaController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly UrlEncoder _urlEncoder;
        private const string AuthenticatorUriFormat = "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6";

        public MobileTfaController(UserManager<AspNetUser> userManager, UrlEncoder urlEncoder)
        {
            _userManager = userManager;
            _urlEncoder = urlEncoder;
        }

        [HttpGet]
        public async Task<IActionResult> GetTfaSetup(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return BadRequest("User does not exist");
            var isTfaEnabled = await _userManager.GetTwoFactorEnabledAsync(user);
            var authenticatorKey = await _userManager.GetAuthenticatorKeyAsync(user);
            if (authenticatorKey == null)
            {
                await _userManager.ResetAuthenticatorKeyAsync(user);
                authenticatorKey = await _userManager.GetAuthenticatorKeyAsync(user);
            }
            var formattedKey = GenerateQrCode(userName, authenticatorKey);
            return Ok(new TfaSetupDto
            { IsTfaEnabled = isTfaEnabled, AuthenticatorKey = authenticatorKey, FormattedKey = formattedKey });
        }
        private string GenerateQrCode(string userName, string unformattedKey)
        {
            return string.Format(
            AuthenticatorUriFormat,
                _urlEncoder.Encode("Smartwork Two-Factor Auth"),
                _urlEncoder.Encode(userName),
                unformattedKey);
        }
        [HttpPost]
        public async Task<IActionResult> PostTfaSetup([FromBody] TfaSetupDto tfaModel)
        {
            var user = await _userManager.FindByNameAsync(tfaModel.UserName);
            var isValidCode = await _userManager
                .VerifyTwoFactorTokenAsync(user,
                  _userManager.Options.Tokens.AuthenticatorTokenProvider,
                  tfaModel.Code);
            if (isValidCode)
            {
                await _userManager.SetTwoFactorEnabledAsync(user, true);
                return Ok(new TfaSetupDto { IsTfaEnabled = true });
            }
            else
            {
                return BadRequest("Invalid code");
            }
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteTfaSetup(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
            {
                return BadRequest("User does not exist");
            }
            else
            {
                await _userManager.SetTwoFactorEnabledAsync(user, false);
                return Ok(new TfaSetupDto { IsTfaEnabled = false });
            }
        }
        [HttpPost]
        public async Task<IActionResult> LoginTfa([FromBody] TfaDto tfaDto)
        {
            var user = await _userManager.FindByNameAsync(tfaDto.UserName);
            if (user == null)
                return Unauthorized(new AuthResponseDto { ErrorMessage = "Invalid Authentication" });
            var validVerification =
              await _userManager.VerifyTwoFactorTokenAsync(
                 user, _userManager.Options.Tokens.AuthenticatorTokenProvider, tfaDto.Code);
            if (!validVerification)
                return BadRequest("Invalid Token Verification");
            //var signingCredentials = _jwtHandler.GetSigningCredentials();
            //var claims = _jwtHandler.GetClaims(user);
            //var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            //var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return Ok(new AuthResponseDto { IsAuthSuccessful = true, IsTfaEnabled = true, Token = "" });
        }
    }
    public class AuthResponseDto
    {
        public bool IsAuthSuccessful { get; set; }
        public bool IsTfaEnabled { get; set; }
        public string ErrorMessage { get; set; }
        public string Token { get; set; }
    }
    public class TfaDto
    {
        public string UserName { get; set; }
        public string Code { get; set; }
    }
    public class TfaSetupDto
    {
        public string UserName { get; set; }
        public string Code { get; set; }
        public bool IsTfaEnabled { get; set; }
        public string AuthenticatorKey { get; set; }
        public string FormattedKey { get; set; }
    }
}

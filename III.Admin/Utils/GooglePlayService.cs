using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Playcustomapp.v1;
using System.Threading.Tasks;
using Google.Apis.AndroidPublisher.v3;
using Google.Apis.AndroidPublisher.v3.Data;
using System.Collections.Generic;
using System;
using System.Linq;
using Google.Apis.Util.Store;
using System.IO;
using System.Threading;

namespace III.Admin.Utils
{
    public class GooglePlayService
    {
        //public async Task<bool> CheckIfSmartworkVersionIsLive()
        //{
        //    var keyFilePath = "";
        //    GoogleCredential credential = await GetGoogleCredentialAsync(keyFilePath);
        //    return false;
        //}

        public Task<GoogleCredential> GetGoogleCredentialAsync(string keyFilePath)
        {
            GoogleCredential credential;
            using (var stream = new FileStream(keyFilePath, FileMode.Open, FileAccess.Read))
            {
                credential = GoogleCredential.FromStream(stream).CreateScoped(AndroidPublisherService.Scope.Androidpublisher);
            }
            return Task.FromResult(credential);
        }

        public async Task<bool> CheckIfVersionIsLive(GoogleCredential credential, string applicationName, string packageName, int versionCodeToCheck)
        {
            var service = GetAndroidPublisherService(credential, applicationName);
            var activeVersionCodes = await GetActiveVersionCodes(service, packageName);

            if (activeVersionCodes.Contains(versionCodeToCheck))
            {
                Console.WriteLine("Version is live!");
                return true;
            }
            else
            {
                Console.WriteLine("Version is not live.");
                return false;
            }
        }

        public AndroidPublisherService GetAndroidPublisherService(GoogleCredential credential, string applicationName)
        {
            var service = new AndroidPublisherService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = applicationName,
            });

            return service;
        }

        public async Task<List<int>> GetActiveVersionCodes(AndroidPublisherService service, string packageName)
        {
            var activeVersionCodes = new List<int>();

            // Start a new edit to modify this app.
            var edit = new AppEdit { Id = Guid.NewGuid().ToString(), ExpiryTimeSeconds = "3600" };
            var insertedEdit = await service.Edits.Insert(edit, packageName).ExecuteAsync();

            // Get active tracks
            var tracks = await service.Edits.Tracks.List(packageName, insertedEdit.Id).ExecuteAsync();

            // Find the production track and get version codes
            var productionTrack = tracks.Tracks.FirstOrDefault(t => t.TrackValue.Equals("production", StringComparison.OrdinalIgnoreCase));
            if (productionTrack != null && productionTrack.Releases != null)
            {
                foreach (var release in productionTrack.Releases)
                {
                    if (release.Status.Equals("completed", StringComparison.OrdinalIgnoreCase) && release.VersionCodes != null)
                    {
                        activeVersionCodes.AddRange(release.VersionCodes.Select(longCode => Convert.ToInt32(longCode)));
                    }
                }
            }

            return activeVersionCodes;
        }
        
    }

}

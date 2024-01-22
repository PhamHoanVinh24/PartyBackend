using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ZOOM_MANAGE")]
    public class ZoomManage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string ZoomId { get; set; }

        public string ZoomName { get; set; }

        public string ZoomPassword { get; set; }

        public string Note { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string AccountZoom { get; set; }
        public string Group { get; set; }
        public string ListUserAccess { get; set; }
        public string ListUserJoin { get; set; }
        public string Chanel { get; set; }
        public string JoinUrl { get; set; }
/*
        public int? MeetingScheduleId { get; set; }
*/
        public string HostClaimCode { get; set; }
    }
    public class ZoomModel
    {
        public ZoomModel()
        {
            ListUserMeeting = new List<UserJoinMeeting>();
        }

        public string MeetingTopic { get; set; }
        public string RoomID { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public string Data { get; set; }
        public int? MeetingId { get; set; }
        public List<UserJoinMeeting> ListUserMeeting { get; set; }
    }
    public class UserJoinMeeting
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string GivenName { get; set; }
    }

    public class ZoomData
    {
        public string topic { get; set; }
        public int type { get; set; }
        public string password { get; set; }
        public ZoomSetting settings { get; set; }
    }

    public class ZoomAuthResult
    {
        [JsonProperty(PropertyName = "access_token")]
        public string AccessToken { get; set; }
        [JsonProperty(PropertyName = "token_type")]
        public string TokenType { get; set; }
        [JsonProperty(PropertyName = "refresh_token")]
        public string RefreshToken { get; set; }
        [JsonProperty(PropertyName = "expires_in")]
        public string ExpiresIn { get; set; }
        [JsonProperty(PropertyName = "scope")]
        public string Scope { get; set; }
    }

    public class ZoomSetting
    {
        public bool host_video { get; set; }
        public bool participant_video { get; set; }
        public bool join_before_host { get; set; }
        public int approval_type { get; set; }
        public bool waiting_room { get; set; }
    }

    public class ZoomHostSetting
    {
        [JsonProperty(PropertyName = "host_key")]
        public string HostKey { get; set; }
    }
}
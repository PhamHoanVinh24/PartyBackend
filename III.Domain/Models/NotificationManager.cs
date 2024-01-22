using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
	[Table("NOTIFICATION_MANAGER")]
	public class NotificationManager
    {
		public NotificationManager()
		{
            ListUser = new List<UserNotify>();
		}

		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }

		[StringLength(255)]
		public string NotifyCode { get; set; }

		[StringLength(255)]
		public string Title { get; set; }

		[StringLength(255)]
		public string ObjType { get; set; }

		[StringLength(255)]
		public string ObjCode { get; set; }

        [StringLength(50)]
		public string CreatedBy { get; set; }

		public DateTime? CreatedTime { get; set; }
		[StringLength(50)]
		public string UpdatedBy { get; set; }

		public DateTime? UpdatedTime { get; set; }

		[StringLength(50)]
		public string DeletedBy { get; set; }

		public DateTime? DeletedTime { get; set; }

		public bool IsDeleted { get; set; }

        [NotMapped]
        public List<UserNotify> ListUser { get; set; }

        public string JsonData
        {
            get
            {
                return JsonConvert.SerializeObject(ListUser);
            }
            set
            {
                ListUser = string.IsNullOrEmpty(value)
                ? new List<UserNotify>()
                : JsonConvert.DeserializeObject<List<UserNotify>>(value);
            }
        }
    }

    public class UserNotify
    {
        public string UserId { get; set; }
        public bool IsRead { get; set; }
    }
}
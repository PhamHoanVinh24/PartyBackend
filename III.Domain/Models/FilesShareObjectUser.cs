using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FILES_SHARE_OBJECT_USER")]
    public class FilesShareObjectUser
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string FileID { get; set; }
        public string ObjectRelative { get; set; }
        public string FileCreated { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }

        [NotMapped]
        public List<UserShare> UserShares { get; set; }

        public string ListUserShare
        {
            get
            {
                return JsonConvert.SerializeObject(UserShares);
            }
            set
            {
                UserShares = string.IsNullOrEmpty(value)
                ? new List<UserShare>()
                : JsonConvert.DeserializeObject<List<UserShare>>(value);
            }
        }
    }

    public class UserShare
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string DepartmentName { get; set; }
        public PermissionFile Permission { get; set; }
    }

    public class PermissionFile
    {
        public PermissionFile()
        {
            Read = true;
            Write = true;
            Delete = true;
        }
        public bool Read { get; set; }
        public bool Write { get; set; }
        public bool Delete { get; set; }
    }
}

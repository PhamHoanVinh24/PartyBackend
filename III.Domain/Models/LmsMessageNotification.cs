using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("LMS_MSG_NOTIFICATION")]
    public class LmsMessageNotification
    {
      //  SELECT TOP(1000) [ID]
      //,[MSG_CONTENT]
      //,[MSG_TYPE]
      //,[UPDATED_DATE]
      //,[CREATED_BY]
      //,[CREATED_DATE]
      //,[UPDATED_BY]
      //,[IS_ENABLED]
      //,[IS_DELETED]
      //,[DELETED_BY]
      //,[DELETED_TIME]
      //  FROM[SmartWork_3I].[dbo].[LMS_MSG_NOTIFICATION]

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string MsgContent { get; set; }

        public string MsgType { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public bool IsEnabled { get; set; }
        public bool IsDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace III.Domain.Models
{
    [Table("CRAWLER_RUNNING_LOG")] //BOT_RUNNING_LOG
    public class BogRunningLog
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string  SessionCode{ get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime?  EndTime{ get; set; }

        public string  UrlScanJson{ get; set; }

        public string  FileDownloadJson{ get; set; }
        public int?  NumOfFile{ get; set; }

        public string  FileResultData{ get; set; }


        public int?  NumPasscap{ get; set; }
        public int? TimeScan { get; set; }


        public string  UserIdRunning{ get; set; }

        public string Ip { get; set; }
        public string Status { get; set; }

        public string BotCode { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }


        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }


        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsDeleted { get; set; }
        public string KeyWord { get; set; }
        public string UrlMatchSearch { get; set; }

    }
}

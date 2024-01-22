using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CRAWLER_SESSION_CONTENT_RESULT")]
    public class CrawlerSessionContentResult
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string BotCode { get; set; }
        public string  SessionCode{ get; set; }


        public string  LinkPost{ get; set; }
        /*public byte TextContent { get; set; }*/
        public string TextContent { get; set; }
        public string MediaCrawl { get; set; }
        public string  KeyWord{ get; set; }
        public string KeyWordJson { get; set; }

        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }

        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }


    }
}

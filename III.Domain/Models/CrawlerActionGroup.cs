using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CRAWLER_ACTION_GROUP")]
    public class CrawlerActionGroup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string GroupId { get; set; }
        public string PostId { get; set; }
        public bool? IsOwned { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CAT_ACTIVITY")]
    public class CatActivity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [StringLength(100)]
        public string ActCode { get; set; }
        [StringLength(100)]
        public string ActName { get; set; }
        [StringLength(1000)]
        public string Note { get; set; }

        [StringLength(100)]
        public string ActType { get; set; }

        [StringLength(100)]
        public string ActGroup { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(100)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public int? IdMapping { get; set; }
        public string FileUrl { get; set; }
        public string FileName { get; set; }
    }
}

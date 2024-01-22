using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("JC_OBJECT_ID_RELATIVE")]
    public class JcObjectIdRelative
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string ObjTypeCode { get; set; }
        public string ObjID { get; set; }
        public string Relative { get; set; }
        public string CardCode { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public decimal? Weight { get; set; }
        public string ItemCode { get; set; }

        //RESULT_PERCENT
        public decimal? ResultPercent { get; set; }
    }
}

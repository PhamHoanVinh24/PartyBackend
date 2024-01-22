using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_OBJECT_IMPACT")]
    public class UrencoObjectImpact
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)] 
        public string ShiftCode { get; set; }

        [StringLength(255)]
        public string ActCode { get; set; }

        [StringLength(255)]
        public string ObjTypeCode { get; set; }
        [StringLength(255)]
        public string ObjCode { get; set; }

        public string JsonValue { get; set; }
        [StringLength(255)]
        public string CreateBy { get; set; }

        public DateTime? CreateTime { get; set; }

        [StringLength(255)]
        public string UpdateBy { get; set; }

        public DateTime? UpdateTime { get; set; }

        [StringLength(255)]
        public string DeleteBy { get; set; }

        public DateTime? DeleteTime { get; set; }

        public bool IsDelete { get; set; }
    }
}

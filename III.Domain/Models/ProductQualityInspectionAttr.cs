using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ESEIM.Models
{
    public partial class ProductQualityInspectionAttr
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? ProductQualityInspectionId { get; set; }
        public string AttrCode { get; set; }
        public string AttrGroup { get; set; }
        public string SessionCode { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool? IsDeleted { get; set; }
        public string Unit { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }

        public virtual ProductQualityInspectionImpDetails ProductQualityInspection { get; set; }
    }
}

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_PARAMETER")]
    public class AdParameter
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public decimal ParameterId { get; set; }

        [Key]
        [StringLength(50)]
        public string ParameterCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [StringLength(50)]
        public string Value { get; set; }
        [StringLength(50)]
        public string Value2 { get; set; }
        [StringLength(50)]
        public string Value3 { get; set; }
        [StringLength(50)]
        public string Value4 { get; set; }
        [StringLength(50)]
        public string Value5 { get; set; }

        [StringLength(50)]
        public string ParentCode { get; set; }
        [JsonIgnore]
        [ForeignKey("ParentCode")]
        [InverseProperty("InverseParent")]
        public virtual AdParameter Parent { get; set; }
        [JsonIgnore]
        public virtual ICollection<AdParameter> InverseParent { get; set; }
    }
}
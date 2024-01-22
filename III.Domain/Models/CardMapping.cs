using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CARD_MAPPING")]
    public class CardMapping
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string BoardCode { get; set; }

        [StringLength(255)]
        public string ListCode { get; set; }

        [StringLength(255)]
        public string ProjectCode { get; set; }

        [StringLength(255)]
        public string ContractCode { get; set; }

        [StringLength(255)]
        public string CustomerCode { get; set; }

        [StringLength(255)]
        public string SupplierCode { get; set; }

        [StringLength(50)]
        public string Relative { get; set; }

        [StringLength(255)]
        public string TeamCode { get; set; }

        [StringLength(255)]
        public string GroupUserCode { get; set; }

        [StringLength(255)]
        public string UserId { get; set; }

        public string Responsibility { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
}
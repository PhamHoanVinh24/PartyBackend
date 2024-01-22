using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ASSET_ALLOCATE_DETAILS")]
    public class AssetAllocateDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string AssetCode { get; set; }
        [StringLength(50)]
        public int Quantity { get; set; }
        [StringLength(255)]
        public string CostValue { get; set; }
        [StringLength(255)]
        public string ListImages { get; set; }
        [StringLength(100)]
        public string Status { get; set; }
        [StringLength(100)]
        public string Note { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        [StringLength(7)]
        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        [StringLength(7)]
        public DateTime? UpdatedTime { get; set; }
        //[StringLength(50)]
        public bool IsDeleted { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }


    }
}
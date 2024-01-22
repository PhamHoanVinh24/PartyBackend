using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RECORD_DELIVERY_HEADER")]
    public class AssetRecordDeliveryHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string DeliveryCode { get; set; }

        public string Title { get; set; }

        public string DeliveryType { get; set; }

        public string Note { get; set; }

        public string DeliverCode { get; set; }

        public string ReceiverName { get; set; }

        public string Status { get; set; } 

        public DateTime? ExpertedReturnDate { get; set; }

        public DateTime? RealReturnDate { get; set; }

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
    }
}

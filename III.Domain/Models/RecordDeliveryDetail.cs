using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("RECORD_DELIVERY_DETAIL")]
    public class RecordDeliveryDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string RecordCode { get; set; }

        public string DeliveryCode { get; set; }

    }
}

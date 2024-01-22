using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("MESSAGE_ACTIVITY")]
    public class MessageActivity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string User { get; set; }

        public string ActFrom { get; set; }

        public string ActTo { get; set; }

        public string Command { get; set; }

        public DateTime CommandTime { get; set; }

        public string Confirm { get; set; }

        public DateTime? ConfirmTime { get; set; }

        public string ConfirmedBy { get; set; }

        public string Note { get; set; }

    }
}

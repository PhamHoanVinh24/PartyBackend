using ESEIM.Models;
using ESEIM.Utils;
using Hot.Models.AccountViewModels;
using III.Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace III.Admin.Controllers
{
	public class UserProfileController : Controller
	{

		private readonly EIMDBContext _context;

		public UserProfileController(EIMDBContext context)
		{
			_context = context;
		}
		public IActionResult Index()
		{
			return View();
		}
		public IActionResult Login()
		{
			return View();
		}
		public IActionResult Register()
		{
			return View();
		}

		[HttpPost]
		public IActionResult Login(LoginViewModel model)
		{
			return Redirect("/Home/Index");
		}

        #region get
        public object GetPartyAdmissionProfile()
        {
            var user = _context.PartyAdmissionProfiles.ToList();
            return user;
        }
        public object GetPartyAdmissionProfileByResumeNumber( string resumeNumber)
        {
            var user = _context.PartyAdmissionProfiles.FirstOrDefault(x => x.ResumeNumber == resumeNumber);
            return user;
        }
        /*public object GetPartyAdmissionProfileByUserCode([FromBody] int userCode)
        {
            var user = _context.PartyAdmissionProfiles.FirstOrDefault(x => x.UserCode == userCode);
            return user;
        }*/
        public object GetPartyAdmissionProfileByUserCode( int Id)
        {
            var user = _context.PartyAdmissionProfiles.FirstOrDefault(x => x.Id == Id);
            return user;
        }

        public object GetFamily()
        {
            var rs = _context.Families.ToList();
            return rs;
        }
        public object GetFamilyById( int id)
        {
            var rs = _context.Families.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetFamilyByProfileCode( string profileCode)
        {
            var rs = _context.Families.Where(p => p.ProfileCode == profileCode);
            return rs;
        }

        public object GetIntroducerOfParty()
        {
            var rs = _context.IntroducerOfParties.ToList();
            return rs;
        }
        public object GetIntroducerOfPartyById(int id)
        {
            var rs = _context.IntroducerOfParties.FirstOrDefault(p => p.id == id);
            return rs;
        }
        public object GetIntroducerOfPartyByProfileCode( string profileCode)
        {
            var rs = _context.IntroducerOfParties.Where(p => p.ProfileCode == profileCode);
            return rs;
        }

        public object GetAward()
        {
            var rs = _context.Awards.ToList();
            return rs;
        }
        public object GetAwardById( int id)
        {
            var rs = _context.Awards.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetAwardByProfileCode( string profileCode)
        {
            var rs = _context.Awards.Where(p => p.ProfileCode == profileCode);
            return rs;
        }
        public object GetGoAboard()
        {
            var rs = _context.GoAboards.ToList();
            return rs;
        }
        public object GetGoAboardById( int id)
        {
            var rs = _context.GoAboards.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetGoAboardByProfileCode(string profileCode)
        {
            var rs = _context.GoAboards.Where(p => p.ProfileCode == profileCode);
            return rs;
        }

        public object GetPersonalHistory()
        {
            var rs = _context.PersonalHistories.ToList();
            return rs;
        }
	
        public object GetPersonalHistoryById( int id)
        {
            var rs = _context.PersonalHistories.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetPersonalHistoryByProfileCode( string profileCode)
        {
            var rs = _context.PersonalHistories.Where(p => p.ProfileCode == profileCode);
            return rs;
        }
        public object GetTrainingCertificatedPass()
        {
            var rs = _context.TrainingCertificatedPasses.ToList();
            return rs;
        }
        public object GetTrainingCertificatedPassById( int id)
        {
            var rs = _context.TrainingCertificatedPasses.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetTrainingCertificatedPassByProfileCode( string profileCode)
        {
            var rs = _context.TrainingCertificatedPasses.Where(p => p.ProfileCode == profileCode);
            return rs;
        }

        public object GetWorkingTracking()
        {
            var rs = _context.WorkingTrackings.ToList();
            return rs;
        }
        public object GetWorkingTrackingById( int id)
        {
            var rs = _context.WorkingTrackings.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetWorkingTrackingByProfileCode(string profileCode)
        {
            var rs = _context.WorkingTrackings.Where(p => p.ProfileCode == profileCode);
            return rs;
        }

        public object GetHistorySpecialist()
        {
            var rs = _context.HistorySpecialists.ToList();
            return rs;
        }
        public object GetHistorySpecialistById(int id)
        {
            var rs = _context.HistorySpecialists.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetHistorySpecialistByProfileCode(string profileCode)
        {
            var rs = _context.HistorySpecialists.Where(p => p.ProfileCode == profileCode);
            return rs;
        }

        public object GetWarningDisciplined()
        {
            var rs = _context.WarningDisciplineds.ToList();
            return rs;
        }
        public object GetWarningDisciplinedById(int id)
        {
            var rs = _context.WarningDisciplineds.FirstOrDefault(p => p.Id == id);
            return rs;
        }
        public object GetWarningDisciplinedByProfileCode(string profileCode)
        {
            var rs = _context.WarningDisciplineds.Where(p => p.ProfileCode == profileCode);
            return rs;
        }
        #endregion

        #region Update

        [HttpPost]
		public object PartyRegist()
		{
			var msg = new JMessage() { Error = false };
			try
			{

			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Hoàn cảnh gia đình thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object UpdateFamily([FromBody] Family model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.Families.Find(model.Id);

				obj.Name = model.Name;
				obj.WorkingProgress = model.WorkingProgress;
				obj.Relation = model.Relation;
				obj.ClassComposition = model.ClassComposition;
				obj.PartyMember = model.PartyMember;
				obj.BirthYear = model.BirthYear;
				obj.DeathReason = model.DeathReason;
				obj.DeathYear = model.DeathYear;
				obj.HomeTown = model.HomeTown;
				obj.Residence = model.Residence;
				obj.Job = model.Job;
				obj.WorkingProgress = model.WorkingProgress;
				obj.Name = model.Name;
				_context.Families.Update(obj);
				_context.SaveChanges();
				msg.Title = "Cập nhật Hoàn cảnh gia đình thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Hoàn cảnh gia đình thất bại";
			}
			return msg;
		}
        [HttpPut]
        public object UpdatePartyAdmissionProfile( [FromBody] PartyAdmissionProfile model)
        {
            var msg = new JMessage() { Error = false };
			var obj = _context.PartyAdmissionProfiles.FirstOrDefault(x => x.ResumeNumber == model.ResumeNumber);
            try
            {
            

                //    obj.CurrentName = currentName;
                obj.CurrentName = model.CurrentName;
                obj.Birthday = model.Birthday;
                obj.BirthName = model.BirthName;
                obj.Gender = obj.Gender;
                obj.Nation = obj.Nation;
                obj.Religion = obj.Religion;
                obj.PermanentResidence = model.PermanentResidence;
                obj.Phone = model.Phone;
                obj.Picture = model.Picture;
                obj.HomeTown = model.HomeTown;
                obj.PlaceBirth = model.PlaceBirth;
                obj.Job = model.Job;
                obj.TemporaryAddress = model.TemporaryAddress;
                obj.GeneralEducation = model.GeneralEducation;
                obj.JobEducation = model.JobEducation;
                obj.ItDegree = model.ItDegree;
                obj.Degree = model.Degree;
                obj.PoliticalTheory = model.PoliticalTheory;
                obj.ForeignLanguage = model.ForeignLanguage;
                obj.ItDegree = model.ItDegree;
                obj.MinorityLanguages = model.MinorityLanguages;
                obj.SelfComment = model.SelfComment;
                obj.CreatedPlace = model.CreatedPlace;
                obj.ResumeNumber = model.ResumeNumber;



                _context.PartyAdmissionProfiles.Update(obj);
                _context.SaveChanges();

                msg.Title = "Cập nhật Sơ yếu lí lịch thành công";
            }
            catch (Exception err)
            {
                msg.Error = true;
                msg.Title = "Cập nhật Sơ yếu lí lịch thất bại";
            }
            return msg;
        }
        [HttpPost]
		public object UpdateIntroduceOfParty([FromBody] IntroducerOfParty model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.IntroducerOfParties.FirstOrDefault(x=>x.ProfileCode==model.ProfileCode);

				obj.PersonIntroduced = model.PersonIntroduced;
				obj.PlaceTimeJoinParty = model.PlaceTimeJoinParty;
				obj.PlaceTimeJoinUnion = model.PlaceTimeJoinUnion;
				obj.PlaceTimeRecognize = model.PlaceTimeRecognize;

				_context.IntroducerOfParties.Update(obj);
				_context.SaveChanges();

				msg.Title = "Cập nhật Người giới thiệu thành công";

			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Người giới thiệu thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object UpdatePersonalHistories([FromBody] PersonalHistory[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				if(model!=null && model.Length > 0)
				{
					foreach(var x in model)
					{
						if(x.End!=null || x.Begin!=null || !string.IsNullOrEmpty(x.Content))
						{
                            var obj = _context.PersonalHistories.FirstOrDefault(y=>y.ProfileCode==x.ProfileCode);

                            obj.Begin = x.Begin;
                            obj.End = x.Begin;
                            obj.Content = x.Content;

                            _context.PersonalHistories.Update(obj);
							_context.SaveChanges() ;
                        }
  
                    }
                    msg.Title = "Cập nhật Lịch sử cá nhân thành công";
					return msg;
                }
				else
				{
					msg.Error = true;
					msg.Title = "Cập nhật Lịch sử cá nhân thành công";
					return msg;
                }
				

			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Lịch sử cá nhân thất bại";
			}
			return msg;
		}

        [HttpPost]
        public object UpdatePersonalHistory([FromBody] PersonalHistory model)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (model != null)
                {
                    var obj = _context.PersonalHistories.FirstOrDefault(y => y.Id == model.Id);

                    obj.Begin = model.Begin;
                    obj.End = model.End;
                    obj.Content = model.Content;

                    _context.PersonalHistories.Update(obj);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật Lịch sử cá nhân thành công";
                    return msg;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Cập nhật Lịch sử cá nhân thành công";
                    return msg;
                }


            }
            catch (Exception err)
            {
                msg.Error = true;
                msg.Title = "Cập nhật Lịch sử cá nhân thất bại";
            }
            return msg;
        }

        [HttpPost]
		public object UpdateGoAboard([FromBody] GoAboard model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.GoAboards.Find(model.Id);

				obj.From = model.From;
				obj.To = model.To;
				obj.Contact = model.Contact;
				obj.Country = model.Country;

				_context.GoAboards.Update(obj);
				_context.SaveChanges();

				msg.Title = "Cập nhật Đi nước ngoài thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Đi nước ngoài thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object UpdateTrainingCertificatedPass([FromBody] TrainingCertificatedPass model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.TrainingCertificatedPasses.Find(model.Id);

				obj.SchoolName = model.SchoolName;
				obj.From = model.From;
				obj.To = model.To;
				obj.Class = model.Class;
				obj.Certificate = model.Certificate;

				_context.TrainingCertificatedPasses.Update(obj);
				_context.SaveChanges();
				msg.Title = "Cập nhật Những lớp đào tạo bồi dưỡng đã qua thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Những lớp đào tạo bồi dưỡng đã qua thất bại";
			}
			return msg;
		}

		[HttpPost]
		public object UpdateHistorySpecialist([FromBody] HistorySpecialist model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.HistorySpecialists.Find(model.Id);

				obj.MonthYear = model.MonthYear;
				obj.Content = model.Content;

				_context.HistorySpecialists.Update(obj);
				_context.SaveChanges();
				msg.Title = "Cập nhật Đặc điểm lịch sử thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Đặc điểm lịch sử thất bại";
			}
			return msg;
		}

		[HttpPost]
		public object UpdateWarningDisciplined([FromBody] WarningDisciplined model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.WarningDisciplineds.Find(model.Id);

				obj.MonthYear = model.MonthYear;
				obj.Reason = model.Reason;
				obj.GrantOfDecision = model.GrantOfDecision;

				_context.WarningDisciplineds.Update(obj);
				_context.SaveChanges();
				msg.Title = "Cập nhật Kỷ luật thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Kỷ luật thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object UpdateAward([FromBody] Award model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.Awards.Find(model.Id);

				obj.MonthYear = model.MonthYear;
				obj.Reason = model.Reason;
				obj.GrantOfDecision = model.GrantOfDecision;

				_context.Awards.Update(obj);
				_context.SaveChanges();
				msg.Title = "Cập nhật Khen thưởng thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Khen thưởng thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object UpdateWorkingTracking([FromBody] WorkingTracking model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var obj = _context.WorkingTrackings.Find(model.Id);

				obj.From = model.From;
				obj.To = model.To;
				obj.Work = model.Work;
				obj.Role = model.Role;

				_context.WorkingTrackings.Update(obj);
				_context.SaveChanges();
				msg.Title = "Cập nhật Những công tác và chức vụ đã qua thành công";
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Những công tác và chức vụ đã qua thất bại";
			}
			return msg;
		}

		#endregion

		#region insert

		[HttpPost]
		public object InsertFamily([FromBody] Family[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
                foreach (var x in model)
                {
                    if (!string.IsNullOrEmpty(x.Relation) || !string.IsNullOrEmpty(x.ClassComposition)
                    || !string.IsNullOrEmpty(x.BirthYear) || !string.IsNullOrEmpty(x.HomeTown)
                    || !string.IsNullOrEmpty(x.Residence) || !string.IsNullOrEmpty(x.Job)
                    || !string.IsNullOrEmpty(x.WorkingProgress) || x.PartyMember != null)
                    {
                        _context.Families.Add(x);
                        

                        msg.Title = "Thêm mới Lịch sử bản thân thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Lịch sử bản thân chưa hợp lệ";
						return msg;
                    }
                }
                _context.SaveChanges();
            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm Hoàn cảnh gia đình thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertPartyAdmissionProfile([FromBody] PartyAdmissionProfile model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				if(string.IsNullOrEmpty(model.CurrentName) || string.IsNullOrEmpty(model.BirthName) || string.IsNullOrEmpty(model.Nation) || string.IsNullOrEmpty(model.Religion)
					|| string.IsNullOrEmpty(model.PermanentResidence) || string.IsNullOrEmpty(model.Phone) || string.IsNullOrEmpty(model.Picture)
					|| string.IsNullOrEmpty(model.HomeTown) || string.IsNullOrEmpty(model.PlaceBirth) || string.IsNullOrEmpty(model.Job) || string.IsNullOrEmpty(model.TemporaryAddress)
					|| string.IsNullOrEmpty(model.GeneralEducation) || string.IsNullOrEmpty(model.JobEducation) || string.IsNullOrEmpty(model.UnderPostGraduateEducation)
					|| string.IsNullOrEmpty(model.Degree) || string.IsNullOrEmpty(model.PoliticalTheory) || string.IsNullOrEmpty(model.ForeignLanguage)
					|| string.IsNullOrEmpty(model.ItDegree) || string.IsNullOrEmpty(model.MinorityLanguages) || string.IsNullOrEmpty(model.SelfComment) || string.IsNullOrEmpty(model.ResumeNumber)
					|| model.Birthday!=null
					) { 
					_context.PartyAdmissionProfiles.Add(model);
					_context.SaveChanges();

					msg.Title = "Thêm mới Sơ yêu lí lịch thành công";
				}
				else
				{
					msg.Error = true;
					msg.Title = "Sơ yêu lí lịch chưa hợp lệ";
				}
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm mới Sơ yêu lí lịch thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertIntroduceOfParty([FromBody] IntroducerOfParty model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				if (
					model!=null
					)
				{
					_context.IntroducerOfParties.Add(model);
					_context.SaveChanges();

					msg.Title = "Thêm mới Người giới thiệu thành công";
				}
				else
				{
					msg.Error = true;
					msg.Title = "Người giới thiệu chưa hợp lệ";
				}
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Người giới thiệu thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertPersonalHistory([FromBody] PersonalHistory[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				foreach(var x in model) {
                    if (!string.IsNullOrEmpty(x.Content) || x.Begin != null || x.End != null)
                    {
                        _context.PersonalHistories.Add(x);
                        _context.SaveChanges();

                        msg.Title = "Thêm mới Lịch sử bản thân thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Lịch sử bản thân chưa hợp lệ";
                    }
                }
				
			}
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm Lịch sử bản thân thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertGoAboard([FromBody] GoAboard[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				foreach (var x in model)
				{
					if (!string.IsNullOrEmpty(x.Contact) || !string.IsNullOrEmpty(x.Country)
						|| x.From != null || x.To != null
						)
					{
						_context.GoAboards.Add(x);

						msg.Title = "Thêm mới Đi nước ngoài thành công";
					}
					else
					{
						msg.Error = true;
						msg.Title = "Đi nước ngoài chưa hợp lệ";
						return msg;
					}
				}
                _context.SaveChanges();
            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm Đi nước ngoài thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertTrainingCertificatedPass([FromBody] TrainingCertificatedPass[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
                foreach (var x in model)
                {
                    if ( string.IsNullOrEmpty(x.Class) || string.IsNullOrEmpty(x.Certificate) ||
                    string.IsNullOrEmpty(x.SchoolName) || x.From != null || x.To != null
)
                    {
                        _context.TrainingCertificatedPasses.Add(x);
                        msg.Title = "Thêm mới Đi nước ngoài thành công";
                    }
                    else
                    {
                        msg.Error = true;
						msg.Title = "Đi nước ngoài chưa hợp lệ";
						return msg;
                    }
                }
                _context.SaveChanges();
            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Cập nhật Hoàn cảnh gia đình thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertHistorysSpecialist([FromBody] HistorySpecialist[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
                foreach (var x in model)
                {
                    if (!string.IsNullOrEmpty(x.Content) || x.MonthYear != null)
                    {
                        _context.HistorySpecialists.Add(x);

                        msg.Title = "Thêm mới Lịch sử bản thân thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Lịch sử bản thân chưa hợp lệ";
						return msg;
                    }
                }
                _context.SaveChanges();
            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm Đặc điểm lịch sử thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertWarningDisciplined([FromBody] WarningDisciplined[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
                foreach (var x in model)
                {
                    if (!string.IsNullOrEmpty(x.MonthYear) || !string.IsNullOrEmpty(x.Reason) || !string.IsNullOrEmpty(x.GrantOfDecision))
                    {
                        _context.WarningDisciplineds.Add(x);
                        

                        msg.Title = "Thêm mới Lịch sử bản thân thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Lịch sử bản thân chưa hợp lệ";
						return msg;
                    }
                }
                _context.SaveChanges();
            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm cảnh cáo kỷ luật thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertAward([FromBody] Award[] model)
		{
			var msg = new JMessage() { Error = false };

			try
			{
				foreach (var x in model)
				{
					if (!string.IsNullOrEmpty(x.Reason) || x.MonthYear != null || x.GrantOfDecision != null)
					{
						_context.Awards.Add(x);

						msg.Title = "Thêm mới Lịch sử bản thân thành công";
					}
					else
					{
						msg.Error = true;
						msg.Title = "Lịch sử bản thân chưa hợp lệ";
						return msg;
					}
				}
                _context.SaveChanges();

            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm mới Khen thưởng thất bại";
			}
			return msg;
		}
		[HttpPost]
		public object InsertWorkingTracking([FromBody] WorkingTracking[] model)
		{
			var msg = new JMessage() { Error = false };
			try
			{
                foreach (var x in model)
                {
                    if (!string.IsNullOrEmpty(x.Role) || x.To != null || x.ProfileCode != null)
                    {
                        _context.WorkingTrackings.Add(x);

                        msg.Title = "Thêm mới Lịch sử bản thân thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Lịch sử bản thân chưa hợp lệ";
						return msg;
                    }
                }
                _context.SaveChanges();
            }
			catch (Exception err)
			{
				msg.Error = true;
				msg.Title = "Thêm mới Quá trình công tác thất bại";
			}
			return msg;
		}

		#endregion

		#region delete
		[HttpDelete]
		public object DeleteFamily([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data=_context.Families.FirstOrDefault(x=>x.Id==Id);
				if (data != null)
				{
					data.IsDeleted=true;
					_context.Families.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa hoàn cảnh gia đình thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy hoàn cảnh gia đình";
				}
			}
			catch(Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeleteIntroducerOfParty([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.IntroducerOfParties.FirstOrDefault(x => x.id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.IntroducerOfParties.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa người giới thiệu thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy người giới thiệu";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeletePartyAdmissionProfile([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.PartyAdmissionProfiles.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.PartyAdmissionProfiles.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Hồ sơ lý lịch thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Hồ sơ lí lịch";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeleteAward([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.Awards.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.Awards.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Khen thưởng thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Khen thưởng";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}

		[HttpDelete]
		public object DeleteGoAboard([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.GoAboards.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.GoAboards.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Đi nước ngoài thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Đi nước ngoài";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeletePersonalHistory([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.PersonalHistories.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.PersonalHistories.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Lịch sử cá nhân thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Lịch sử cá nhân";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeleteWorkingTracking([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.WorkingTrackings.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.WorkingTrackings.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Công tác thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Công tác";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeleteTrainingCertificatedPass([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.TrainingCertificatedPasses.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.TrainingCertificatedPasses.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Những lớp đào tạo bồi dưỡng đã qua thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Những lớp đào tạo bồi dưỡng đã qua";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeleteWarningDisciplined([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.WarningDisciplineds.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.WarningDisciplineds.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Cảnh cáo kỉ luật thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Cảnh cáo kỉ luật";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		[HttpDelete]
		public object DeleteHistorySpecialist([FromBody] int Id)
		{
			var msg = new JMessage() { Error = false };
			try
			{
				var data = _context.HistorySpecialists.FirstOrDefault(x => x.Id == Id);
				if (data != null)
				{
					data.IsDeleted = true;
					_context.HistorySpecialists.Remove(data);
					_context.SaveChanges();
					msg.Title = "Xóa Đặc điểm lịch sử thành công";
				}
				else
				{
					msg.Title = "Không tìm thấy Đặc điểm lịch sử";
				}
			}
			catch (Exception ex)
			{
				msg.Error = true;
				msg.Title = "Xóa không thành công";
			}
			return msg;
		}
		#endregion
		
        public string Import(IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            Stream stream = new MemoryStream();
            IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;

            WordDocument document = WordDocument.Load(stream, GetFormatType(type.ToLower()));
            //document.Save(streamSave);

            string sfdt = JsonConvert.SerializeObject(document);

            var outputStream = WordDocument.Save(sfdt, FormatType.Html);
            outputStream.Position = 0;
            StreamReader reader = new StreamReader(outputStream);
            string value = reader.ReadToEnd().ToString();
            return value;
        }

        internal static FormatType GetFormatType(string format)
        {
            if (string.IsNullOrEmpty(format))
                throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            switch (format.ToLower())
            {
                case ".dotx":
                case ".docx":
                case ".docm":
                case ".dotm":
                    return FormatType.Docx;
                case ".dot":
                case ".doc":
                    return FormatType.Doc;
                case ".rtf":
                    return FormatType.Rtf;
                case ".txt":
                    return FormatType.Txt;
                case ".xml":
                    return FormatType.WordML;
                default:
                    throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            }
        }
       /* #region Model
        public class AwardModel
        {
            public string MonthYear { get; set; }
            public string Reason { get; set; }
            public string GrantOfDecision { get; set; }
            public string ProfileCode { get; set; }
        }
        public class FamilyModel
        {
            public string PoliticalAttitude { get; set; }
            public string Relation { get; set; }
            public string ClassComposition { get; set; }
            public bool? PartyMember { get; set; }
            public string BirthYear { get; set; }
            public string DeathYear { get; set; }
            public string DeathReason { get; set; }
            public string HomeTown { get; set; }
            public string Residence { get; set; }
            public string Job { get; set; }
            public string WorkingProgress { get; set; }
            public string Name { get; set; }
            public string ProfileCode { get; set; }
        }
        public class HistorySpecialistModel
        {
            public DateTime? MonthYear { get; set; }
            public string Reason { get; set; }
            public string GrantOfDecision { get; set; }
            public string ProfileCode { get; set; }
        }
        public class PersonalHistoryModel
        {
            public DateTime? Begin { get; set; }
            public DateTime? End { get; set; }
            public string Content { get; set; }
            public string ProfileCode { get; set; }
        }
        public class TrainingCertificatedPassModel
        {
            public string SchoolName { get; set; }
            public string Major { get; set; }
            public string Class { get; set; }
            public DateTime? From { get; set; }
            public DateTime? To { get; set; }
            public string Certificate { get; set; }
            public string ProfileCode { get; set; }
        }
        public class GoAboardModel
        {
            public DateTime? From { get; set; }
            public DateTime? To { get; set; }
            public string Contact { get; set; }
            public string Country { get; set; }
            public string ProfileCode { get; set; }
        }
        public class IntroducerOfPartyModel
        {
            public string PersonIntroduced { get; set; }
            public string PlaceNTimeJoinUnion { get; set; }
            public string PlaceNTimeJoinParty1st { get; set; }
            public string PlaceNTimeRecognize1st { get; set; }
            public string ProfileCode { get; set; }
        }
        public class WorkingTrackingModel
        {
            public int ID { get; set; }
            public DateTime? From { get; set; }
            public DateTime? To { get; set; }
            public string Work { get; set; }
            public string Role { get; set; }
            public string ProfileCode { get; set; }
            public bool? IsDeleted { get; set; }
        }
        public class WarningDisciplinedModel
        {
            public DateTime? MonthYear { get; set; }
            public string Reason { get; set; }
            public string GrantOfDecision { get; set; }
            public string ProfileCode { get; set; }
        }
        public class PartyAdmissionProfileModel
        {
            public string CurrentName { get; set; }
            public string BirthName { get; set; }
            public int? Gender { get; set; }
            public string Nation { get; set; }
            public string Religion { get; set; }
            public DateTime? Birthday { get; set; }
            public string PermanentResidence { get; set; }
            public string Phone { get; set; }
            public string Picture { get; set; }
            public string HomeTown { get; set; }
            public string PlaceBirth { get; set; }
            public string Job { get; set; }
            public string TemporaryAddress { get; set; }
            public string GeneralEducation { get; set; }
            public string JobEducation { get; set; }
            public string UnderNPostGraduateEducation { get; set; }
            public string Degree { get; set; }
            public string PoliticalTheory { get; set; }
            public string ForeignLanguage { get; set; }
            public string ITDegree { get; set; }
            public string MinorityLanguages { get; set; }
            public string PhoneContact { get; set; }
            public string SelfComment { get; set; }
            public string CreatedPlace { get; set; }
            public string ResumeNumber { get; set; }
            public string UserCode { get; set; }
        }

        #endregion
        #region object parse from json
        public class TimePeriodObj
        {
            public string Begin { get; set; }
            public string End { get; set; }
        }

        public class RelationshipObj
        {
            public string Relation { get; set; }
            public string ClassComposition { get; set; }
            public bool PartyMember { get; set; }
            public string Name { get; set; }
            public TimePeriodObj Year { get; set; }
            public string HomeTown { get; set; }
            public string Residence { get; set; }
            public string Job { get; set; }
            public List<string> WorkingProcess { get; set; }
            public List<string> PoliticalAttitude { get; set; }
        }

        public class GoAboardObj
        {
            public string Purpose { get; set; }
            public string Country { get; set; }
        }

        public class DisciplinedObj
        {
            public string Time { get; set; }
            public string OfficialReason { get; set; }
            public string GrantDecision { get; set; }
        }

        public class PersonalHistoryObj
        {
            public TimePeriodObj Time { get; set; }
            public string Infor { get; set; }
        }

        public class CreateObj
        {
            public string Place { get; set; }
            public string CreatedTime { get; set; }
        }

        public class SelfCommentObj
        {
            public string Context { get; set; }
        }

        public class InformationUserObj
        {
            public class LevelEducationObj
            {
                public List<string> Undergraduate { get; set; }
                public List<string> PoliticalTheory { get; set; }
                public List<string> ForeignLanguage { get; set; }
                public List<string> It { get; set; }
                public List<string> MinorityLanguage { get; set; }
                public string GeneralEducation { get; set; }
                public string VocationalTraining { get; set; }
                public string RankAcademic { get; set; }
            }

            public LevelEducationObj Education { get; set; }
            public string FistName { get; set; }
            public string Sex { get; set; }
            public string LastName { get; set; }
            public string DateofBird { get; set; }
            public string HomeTown { get; set; }
            public string PlaceofBirth { get; set; }
            public string Nation { get; set; }
            public string Religion { get; set; }
            public string NowEmployee { get; set; }
            public string PlaceinGroup { get; set; }
            public string DateInGroup { get; set; }
            public string PlaceInParty { get; set; }
            public string DateInParty { get; set; }
            public string PlaceRecognize { get; set; }
            public string DateRecognize { get; set; }
            public string Presenter { get; set; }
            public string Phone { get; set; }
            public string PhoneLL { get; set; }
        }

        public class BusinessNDutyObj
        {
            public TimePeriodObj Time { get; set; }
            public string Business { get; set; }
            public string Duty { get; set; }
        }

        public class MyDataModel
        {
            public InformationUserObj InformationUser { get; set; }
            public CreateObj Create { get; set; }
            public List<PersonalHistory> PersonalHistory { get; set; }
            public List<BusinessNDutyObj> BusinessNDuty { get; set; }
            public List<PassedTrainingClassObj> PassedTrainingClasses { get; set; }
            public List<GoAboardObj> GoAboard { get; set; }
            public List<DisciplinedObj> Disciplined { get; set; }
            public SelfCommentObj SelfComment { get; set; }
            public List<RelationshipObj> Relationship { get; set; }
        }

        public class PassedTrainingClassObj
        {
            public string School { get; set; }
            public string Class { get; set; }
            public TimePeriodObj Time { get; set; }
            public string Business { get; set; }
        }
        #endregion*/
    }
}

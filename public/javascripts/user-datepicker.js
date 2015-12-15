
			$(function () {




$(document).foundation({
"magellan-expedition": {
  active_class: 'active', // specify the class used for active sections
  threshold: 0, // how many pixels until the magellan bar sticks, 0 = auto
  destination_threshold: 20, // pixels from the top of destination for it to be considered active
  throttle_delay: 50, // calculation throttling to increase framerate
  fixed_top: 0, // top distance in pixels assigend to the fixed element on scroll
  offset_by_height: true // whether to offset the destination by the expedition height. Usually you want this to be true, unless your expedition is on the side.
}
});






				window.prettyPrint && prettyPrint();
				$('#dp1').fdatepicker({
					format: 'mm-dd-yyyy',
					disableDblClickSelection: true
				});


				$('#dp2').fdatepicker({
					closeButton: true
				});
				$('#dp3').fdatepicker();


				$('#dpt').fdatepicker({
					format: 'mm-dd-yyyy hh:ii',
					disableDblClickSelection: true,
					language: 'vi',
					pickTime: true
				});

				// datepicker limited to months
				$('#dpMonths').fdatepicker();



				// implementation of custom elements instead of inputs
				var startDate = new Date(2012, 1, 20);
				var endDate = new Date(2012, 1, 25);
				$('#dp4').fdatepicker()
					.on('changeDate', function (ev) {
					if (ev.date.valueOf() > endDate.valueOf()) {
						$('#alert').show().find('strong').text('The start date can not be greater then the end date');
					} else {
						$('#alert').hide();
						startDate = new Date(ev.date);
						$('#startDate').text($('#dp4').data('date'));
					}
					$('#dp4').fdatepicker('hide');
				});
				$('#dp5').fdatepicker()
					.on('changeDate', function (ev) {
					if (ev.date.valueOf() < startDate.valueOf()) {
						$('#alert').show().find('strong').text('The end date can not be less then the start date');
					} else {
						$('#alert').hide();
						endDate = new Date(ev.date);
						$('#endDate').text($('#dp5').data('date'));
					}
					$('#dp5').fdatepicker('hide');
				});









				// implementation of disabled form fields
				var nowTemp = new Date();
				var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
				var checkin = $('#dpd1').fdatepicker({
					onRender: function (date) {
						return date.valueOf() < now.valueOf() ? 'disabled' : '';
					}
				}).on('changeDate', function (ev) {
					if (ev.date.valueOf() > checkout.date.valueOf()) {
						var newDate = new Date(ev.date)
						newDate.setDate(newDate.getDate() + 1);
						checkout.update(newDate);
					}
					checkin.hide();
					$('#dpd2')[0].focus();
				}).data('datepicker');
				var checkout = $('#dpd2').fdatepicker({
					onRender: function (date) {
						return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
					}
				}).on('changeDate', function (ev) {
					checkout.hide();
				}).data('datepicker');
			});
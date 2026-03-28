import { Injectable } from '@angular/core';
import {
  LucideAlertTriangle,
  LucideBuilding2,
  LucideCalendar,
  LucideCalendarDays,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircleX,
  LucideClock3,
  LucideEraser,
  LucideMapPinned,
  LucideNotebookPen,
  LucidePencil,
  LucidePhone,
  LucidePlus,
  LucideSave,
  LucideTag,
  LucideUserRound,
  LucideUsers,
  LucideX,
} from 'lucide-angular';

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  readonly alertTriangle = LucideAlertTriangle;
  readonly building2 = LucideBuilding2;
  readonly calendar = LucideCalendar;
  readonly calendarDay = LucideCalendarDays;
  readonly chevronLeft = LucideChevronLeft;
  readonly chevronRight = LucideChevronRight;
  readonly circleX = LucideCircleX;
  readonly clock3 = LucideClock3;
  readonly eraser = LucideEraser;
  readonly mapPinned = LucideMapPinned;
  readonly notebookPen = LucideNotebookPen;
  readonly pencil = LucidePencil;
  readonly phone = LucidePhone;
  readonly plus = LucidePlus;
  readonly save = LucideSave;
  readonly tag = LucideTag;
  readonly userRound = LucideUserRound;
  readonly users = LucideUsers;
  readonly iconX = LucideX;
}
